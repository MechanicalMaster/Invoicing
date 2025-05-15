"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Camera, FileText, Mail, MapPin, Phone, Save, User } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import supabase from "@/lib/supabase"

// Form validation schema
const profileFormSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email_address: z.string().email("Please enter a valid email address"),
  phone_number: z.string().min(1, "Phone number is required"),
  current_password: z.string().optional(),
  new_password: z.string().min(6, "Password must be at least 6 characters").optional(),
  confirm_password: z.string().optional(),
}).refine(data => {
  // Only validate passwords if current_password is provided
  if (data.current_password && data.current_password.length > 0) {
    if (!data.new_password || data.new_password.length === 0) {
      return false;
    }
    if (data.new_password !== data.confirm_password) {
      return false;
    }
  }
  return true;
}, {
  message: "New password and confirm password must match",
  path: ["confirm_password"]
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Initialize form with react-hook-form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: "",
      email_address: "",
      phone_number: "",
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          // If profile doesn't exist, create one
          if (error.code === "PGRST116") {
            const { error: insertError } = await supabase
              .from("profiles")
              .insert({
                id: user.id,
                full_name: user.user_metadata?.full_name || "",
                avatar_url: null,
                email_address: user.email || "",
                phone_number: user.phone || "",
              });
            
            if (insertError) throw insertError;
            
            // Fetch the created profile
            const { data: newProfile, error: fetchError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .single();
            
            if (fetchError) throw fetchError;
            
            populateForm(newProfile);
          } else {
            throw error;
          }
        } else {
          populateForm(data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error loading profile",
          description: "There was a problem loading your profile data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, setValue]);

  // Helper to populate form with profile data
  const populateForm = (profile: any) => {
    setValue("full_name", profile.full_name || "");
    setValue("email_address", profile.email_address || "");
    setValue("phone_number", profile.phone_number || "");
    setAvatarUrl(profile.avatar_url);
  };

  // Handle form submission
  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Update profile data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: values.full_name,
          email_address: values.email_address,
          phone_number: values.phone_number,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update password if requested
      if (values.current_password && values.new_password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: values.new_password,
        });

        if (passwordError) {
          throw passwordError;
        }

        // Clear password fields
        setValue("current_password", "");
        setValue("new_password", "");
        setValue("confirm_password", "");
        
        toast({
          title: "Password updated",
          description: "Your password has been updated successfully.",
        });
      }

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: error.message || "There was a problem updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate avatar fallback from name
  const getAvatarFallback = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-xl">Sethiya Gold</span>
        </Link>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="ml-4 text-xl font-semibold md:text-2xl">My Profile</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Profile Sidebar */}
          <Card className="md:col-span-1">
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-2 border-muted">
                    <AvatarImage src={avatarUrl || "/placeholder.svg?height=96&width=96"} alt="Profile" />
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xl">
                      {getAvatarFallback(user?.user_metadata?.full_name || user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full border-2 border-background bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  >
                    <Camera className="h-4 w-4" />
                    <span className="sr-only">Change avatar</span>
                  </Button>
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-semibold">{user?.user_metadata?.full_name || "User"}</h2>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <Separator />
                <div className="w-full space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{user?.phone || "No phone number"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Content */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information and password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Profile Information</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="full_name"
                          className="pl-10"
                          {...register("full_name")}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.full_name && (
                        <p className="text-sm text-destructive">{errors.full_name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email_address">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email_address"
                          type="email"
                          className="pl-10"
                          {...register("email_address")}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.email_address && (
                        <p className="text-sm text-destructive">{errors.email_address.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone_number"
                        className="pl-10"
                        {...register("phone_number")}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.phone_number && (
                      <p className="text-sm text-destructive">{errors.phone_number.message}</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Change Password</h3>
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Current Password</Label>
                    <Input
                      id="current_password"
                      type="password"
                      {...register("current_password")}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <Input
                      id="new_password"
                      type="password"
                      {...register("new_password")}
                      disabled={isLoading}
                    />
                    {errors.new_password && (
                      <p className="text-sm text-destructive">{errors.new_password.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      {...register("confirm_password")}
                      disabled={isLoading}
                    />
                    {errors.confirm_password && (
                      <p className="text-sm text-destructive">{errors.confirm_password.message}</p>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Saving Changes..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
