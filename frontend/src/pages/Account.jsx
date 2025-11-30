import React, { useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Edit2, Save, Camera, X } from "lucide-react"
import { useSelector } from "react-redux"
import {toast} from 'sonner'
import AlertDialog from "../components/AlertDialog"
import axios from "axios"
import config from "../../config"

function Account() {
  const {user, isAuthenticated, isLoading} = useSelector(state => state.auth);
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
  })
  const [avatarFile ,setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const toggleEdit = () => {
    setIsEditing(!isEditing)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setAvatarPreview(url)
      setAvatarFile(file);
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarPreview(null)
    setAvatarFile(null);
  }

  const handleSave = async () => {
    try {
      const payload = new FormData();

      payload.append('name', formData.name)
      payload.append('email', formData.email)
      if(avatarFile)
        payload.append('avatar', avatarFile);

      await axios.put(`${config.BACKEND_ENDPOINT}/api/user/update`, payload, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toast.info('Account Updated', {
        description: 'Your account has been updated successfully'
      })
    } catch (error) {
      toast.info('Account Update Failed', {
        description: 'An unexpected error occurred while updating your account'
      })
      console.log("Error occurred while saving user profile")
    } finally {
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      avatar: user.avatar || '',
      name: user.name || '',
      email: user.email || ''
    })
    setAvatarFile(null)
    setAvatarPreview(null)
    setIsEditing(false)
  }

  const deleteAccountHandler = async () => {
    try {
      await axios.delete(`${config.BACKEND_ENDPOINT}/api/user/delete`, {withCredentials: true});

      toast.success('Account deleted', {
        description: 'Your account is deleted successfully'
      })
    } catch (error) {
      console.error('Account Deletion Failed', error)
      toast.error('Account Deletion Failed', {
        description: "An error occurred while deleting the account. Please try again later"
      })
    }
  }

  return (
    <div className="w-full min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] flex items-center justify-center bg-background text-foreground transition-colors duration-300 p-4">
      <Card className="w-full max-w-lg bg-card text-card-foreground border border-border shadow-sm">
        <CardHeader className="flex flex-col items-center justify-center text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <Avatar className="h-24 w-24 border border-muted/40 shadow-sm">
                {isEditing ? (
                  avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt="User avatar" />
                  ) : (
                    (formData.avatar ? (
                      <AvatarImage src={formData.avatar} alt="User avatar" />
                    ) : (
                      <AvatarFallback className="text-xl bg-muted/50">
                        {formData.name ? formData.name[0].toUpperCase() : "U"}
                      </AvatarFallback>
                    ))
                  )
                ): (
                  formData.avatar ? (
                  <AvatarImage src={formData.avatar} alt="User avatar" />
                  ) : (
                    <AvatarFallback className="text-xl bg-muted/50">
                      {formData.name ? formData.name[0].toUpperCase() : "U"}
                    </AvatarFallback>
                  )
                )}
              </Avatar>

              {isEditing && (
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="h-6 w-6 text-white" />
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              )}
            </div>

            {isEditing && avatarPreview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveAvatar}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4 mr-1" /> Remove
              </Button>
            )}
          </div>
          <CardTitle className="text-xl font-semibold">
            {formData.name || "User"}
          </CardTitle>
          <CardDescription>Manage your account details</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              className={`transition-all ${
                isEditing
                  ? "bg-background"
                  : "bg-muted cursor-not-allowed text-muted-foreground"
              }`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              className={`transition-all ${
                isEditing
                  ? "bg-background"
                  : "bg-muted cursor-not-allowed text-muted-foreground"
              }`}
            />
          </div>

          <div className="flex justify-end pt-4">
            {!isEditing ? (
              <div className="flex items-center gap-2">
                <AlertDialog
                  actionText={'Delete Account'}
                  title={'Are you sure?'}
                  customStyle=""
                  description={'Account will be permanantly removed. All Videos will also be removed'}
                  actionHandler={deleteAccountHandler}
                />
                <Button
                  onClick={toggleEdit}
                  variant="outline"
                  className="flex items-center gap-2 border-border hover:bg-muted"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCancel}
                  variant='outline'
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Account;