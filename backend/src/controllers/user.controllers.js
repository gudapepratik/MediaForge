import { prisma } from "../config/db.js";
import { abortMultiPartUpload, deleteHlsVideoFiles, deleteImage, uploadImage } from "../config/s3Client.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const updateUser = async (req, res, next) => {
  try {
    const {name, email} = req.body;
    const user = req.user;

    const currentUser = await prisma.user.findUnique({
      where: {
        id: user.id
      }
    })

    let updatePayload = {
      name: name || currentUser.name
    }

    if(email && email !== currentUser.email) {
      // check new email is unique
      const emailUser = await prisma.user.findMany({
        where: {
          email: email
        }
      })

      if(emailUser.length > 0)
        throw new ApiError(402, "User with email Already exists");
      else updatePayload.email = email;
    } else updatePayload.email = currentUser.email;

    const newAvatar = req.file;
    updatePayload.avatar = currentUser.avatar;

    if(avatar) {
      // upload
      try {
        const {url} = await uploadImage(user.id, null, newAvatar, true);
        updatePayload.avatar = url;
      } catch (error) {
        throw new ApiError(400, "Error while updating User details");
      }
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id
      },
      data: {...updatePayload}
    })

    if(updatePayload.avatar !== user.avatar) {
      // delete the previous one
      try {
        await deleteImage(user.avatar);
      } catch (error) {
        console.log("Error while updating user Details")
      }
    }

    // delete temp avatar file from local
    return res.status(200).json(new ApiResponse(200, {user: updatedUser}, "User Details updated successfully"));
  } catch (error) {
    console.log("updateUser Error", error)
    return next(new ApiError(500, "Internal Server Error"))
  }
}

export const deleteAccount = async (req, res, next) => {
  try {
    const user = req.user;

    if(!user)
      throw new ApiError(404, "User Not Found");

    // 1. get pending uploads and abort the uploads
    const pendingUploads = await prisma.video.findMany({
      where: {
        userId: user.id,
        status: 'CREATED',
        upload: {
          status: {in: ['INITIATED', 'UPLOADING']}
        }
      },
      select: {
        id: true,
        storageKey: true,
        upload: {
          select: {
            id: true,
            uploadId: true
          }
        }
      }
    })

    await Promise.allSettled(
      pendingUploads.map(v => abortMultiPartUpload(v.storageKey, v.upload.uploadId))
    )

    // 2. delete all videos
    const readyVideos = await prisma.video.findMany({
      where: {
        userId: user.id,
        status: 'READY'
      },
      select: {
        id: true
      }
    })

    await Promise.allSettled(
      readyVideos.map(v => deleteHlsVideoFiles(user.id, v.id))
    )

    // 3. delete avatar image
    if(user.avatar)
      await deleteImage(user.avatar);

    await prisma.$transaction(async (tx) => {
      await tx.video.deleteMany({
        where: {userId: user.id}
      })
      await tx.user.delete({
        where: {id: user.id}
      })
    })

    // 4. clear session
    await new Promise((resolve, reject) => {
      req.logout((err) => {
        if (err) return reject(err)
        req.session.destroy((err) => {
          if (err) return reject(err)
          res.clearCookie('connect.sid')
          resolve();
        })
      })
    })

    return res.status(200).json(new ApiResponse(200, null, "User has been deleted successfully"))
  } catch (error) {
    console.log("deleteAccount Error", error)
    return next(new ApiError(500, "Internal Server Error"))
  }
}