import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import API from "@/api/api";
import { useToast } from "@/hooks/use-toast";

export default function SignIn() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await API.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.status === "success") {
        login(response.data.data.user, response.data.token);
        toast({
          title: "Logged in successfully",
          description: `Welcome back to BicepsApp, ${response.data.data.user.name}!`,
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 grain-texture">
      <div className="max-w-md w-full space-y-8">
        <Card className="shadow-lg border border-stone-200">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <img src="/logo.png" alt="BicepsApp Logo" className="w-16 h-16 object-contain" />
            </div>
            <CardTitle className="text-3xl font-bold text-stone-900 font-outfit uppercase tracking-tight">
              BicepsApp
            </CardTitle>
            <p className="text-sm text-stone-600">
              Wreck & Build Gym Admin Login
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-normal text-stone-700">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                  placeholder="admin@wreckandbuild.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-normal text-stone-700">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, rememberMe: checked })
                    }
                  />
                  <Label htmlFor="remember-me" className="text-sm text-stone-700">
                    Remember me
                  </Label>
                </div>
              </div>
              <Button type="submit" className="w-full bg-stone-900 hover:bg-stone-800 text-white" disabled={isSubmitting}>
                {isSubmitting ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

