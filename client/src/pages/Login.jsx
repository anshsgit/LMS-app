import React, { useState, useRef, useEffect } from "react"
import { AppWindowIcon, CodeIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export const Login = () => {
  const [loginInput, setLoginInput] = useState({
    email: "",
    password: "",
  });

  const [signupInput, setSignupInput] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e, type) => {
    const { name, value } = e.target;
    if (type === 'login') {
      setLoginInput((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    } else if (type === 'signup') {
      setSignupInput((prevState) => ({
        ...prevState, 
        [name]: value
      }));
    }
  }
  return (
    <div className="flex justify-center">
      <div className="flex w-full max-w-sm flex-col gap-6">
      <Tabs defaultValue="Login">
        <TabsList>
          <TabsTrigger value="Signup">Signup</TabsTrigger>
          <TabsTrigger value="Login">Login</TabsTrigger>
        </TabsList>
        <TabsContent value="Signup">
          <Card>
            <CardHeader>
              <CardTitle>Signup</CardTitle>
              <CardDescription>
                Create a new account and click signup when you're done.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-name">Name</Label>
                <Input id="tabs-demo-name" name="name" value={signupInput.name} placeholder="Name" required='true' onChange={(e) => { handleChange(e, "signup") }} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-username">Email</Label>
                <Input id="tabs-demo-username" name="email" value={signupInput.email} placeholder="Email" required='true'  onChange={(e) => { handleChange(e, "signup") }} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-password">Password</Label>
                <Input id="tabs-demo-password" name="password" value={signupInput.password} placeholder="Password" required='true'  onChange={(e) => { handleChange(e, "signup") }} />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Signup</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="Login">
          <Card>
            <CardHeader>
              <CardTitle>Email</CardTitle>
              <CardDescription>
                Login with your email and password, then click on login button.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-email">Email</Label>
                <Input id="tabs-demo-email" name="email" value={loginInput.email} placeholder="email" required='true' onChange={(e) => { handleChange(e, "login") }} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-password">Password</Label>
                <Input id="tabs-demo-password" name="email" value={loginInput.password} placeholder="password" required='true' onChange={(e) => { handleChange(e, "login") }} />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Login</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
