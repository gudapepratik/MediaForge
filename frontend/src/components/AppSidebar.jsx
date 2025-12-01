import { Home, Video, Upload, Settings, UserCog } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useNavigate } from "react-router"

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "My Videos",
    url: "/videos",
    icon: Video,
  },
  {
    title: "Uploads",
    url: "/uploads",
    icon: Upload,
  },
  {
    title: "My Account",
    url: "/account",
    icon: UserCog,
  },
]

function AppSidebar() {
  const navigate = useNavigate();

  const handleNavigate = (url) => {
    navigate(url);
  }
  return (
    <Sidebar
      variant="none"
      className="collapsed:w-24 pt-16 md:pt-20  bg-background"
    >
      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="">
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className={''}>
                  <SidebarMenuButton asChild >
                    <a
                      onClick={() => handleNavigate(item.url)}
                      className="flex cursor-pointer items-center gap-4 font-satoshi font-medium text-accent-foreground"
                    >
                      <item.icon/>
                      <span className="md:text-base text-lg">
                        {item.title}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export default AppSidebar
