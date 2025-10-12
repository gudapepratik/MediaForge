import { Home, Video, Upload, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

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
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

function AppSidebar() {
  return (
    <Sidebar
      variant="none"
      className="collapsed:w-24 pt-16 md:pt-20 bg-background"
    >
      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild >
                    <a
                      href={item.url}
                      className="flex items-center te gap-4 font-satoshi font-medium text-accent-foreground"
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
