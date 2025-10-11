"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { BarLoader } from "react-spinners";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Loader2 } from "lucide-react";
import { toast } from "sonner";

const SettingsPage = () => {
  const [username, setUsername] = useState("");

  const { data: currentUser, isLoading } = useConvexQuery(api.users.getCurrentUser);
  
  const { mutate: updateUsername, isLoading: isUpdating } = useConvexMutation(api.users.updateUsername);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trim whitespace
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      toast.error("Username cannot be empty");
      return;
    }

    // Client-side validation to catch issues early
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      toast.error("Username can only contain letters, numbers, underscores, and hyphens");
      return;
    }

    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      toast.error("Username must be between 3 and 20 characters");
      return;
    }

    // Debug logging
    console.log("Submitting username:", trimmedUsername);
    console.log("Username length:", trimmedUsername.length);
    console.log("Username char codes:", [...trimmedUsername].map(c => c.charCodeAt(0)));

    try {
      await updateUsername({ username: trimmedUsername });
      toast.success("Username updated successfully!");
      setUsername("");
    } catch (err) {
      console.error("Update username error:", err);
      toast.error(err.message || "Failed to update username");
    }
  };

  if (isLoading) {
    return <BarLoader width={"100%"} color="#D8B4FE" />;
  }

  return (
    <div className="space-y-8 p-4 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text-primary">Settings</h1>
        <p className="text-slate-400 mt-2">
          Manage your profile and account preference
        </p>
      </div>

      <Card className="card-glass max-w-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <User className="h-5 w-5 mr-2" />
            Username Settings
          </CardTitle>
          <CardDescription>
            Set your unique username for your public profile
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">
                Username
              </Label>

              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="bg-slate-800 border-slate-600 text-white"
                maxLength={20}
              />

              {currentUser?.username && (
                <div className="text-sm text-slate-400">
                  Current username:{" "}
                  <span className="text-white">@{currentUser.username}</span>
                </div>
              )}

              <div className="text-xs text-slate-500">
                3–20 characters, letters, numbers, underscores, and hyphens only
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                disabled={isUpdating}
                type="submit"
                variant="primary"
                className="w-full sm:w-auto"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Username"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;