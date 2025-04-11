
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        // Sign up with Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role
            }
          }
        });

        if (error) throw error;
        
        toast.success("Account created successfully! Please check your email for verification.");
      } else {
        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        
        // Login function to update local state
        await login(email, password, role);
      }
    } catch (error: any) {
      console.error("Authentication failed:", error);
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {isSignUp ? "Create an Account" : "Sign In"}
        </CardTitle>
        <CardDescription className="text-center">
          {isSignUp ? "Enter your details to create a new account" : "Choose your role and enter your credentials to sign in"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="student" onValueChange={(value) => setRole(value as "student" | "teacher")}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="student">Student</TabsTrigger>
            <TabsTrigger value="teacher">Teacher</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isSignUp}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {!isSignUp && (
                  <a href="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </a>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <TabsContent value="student" className="mt-0 pt-0">
              <p className="text-sm text-muted-foreground mt-2">
                {isSignUp ? "Create a student account to view your attendance and marks." : "Login as a student to view your attendance, marks and leave records."}
              </p>
            </TabsContent>
            
            <TabsContent value="teacher" className="mt-0 pt-0">
              <p className="text-sm text-muted-foreground mt-2">
                {isSignUp ? "Create a teacher account to manage student records." : "Login as a teacher to manage student attendance, marks and leave records."}
              </p>
            </TabsContent>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (isSignUp ? "Creating Account..." : "Signing in...") : (isSignUp ? "Create Account" : "Sign In")}
            </Button>
          </form>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center w-full">
          <button 
            onClick={() => setIsSignUp(!isSignUp)} 
            className="text-sm text-primary hover:underline"
          >
            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </button>
        </div>
        {!isSignUp && (
          <p className="text-sm text-muted-foreground text-center">
            For demo: <span className="font-semibold">teacher@example.com / password123</span> or <span className="font-semibold">student@example.com / password123</span>
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
