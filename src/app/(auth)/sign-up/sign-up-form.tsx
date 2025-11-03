"use client";

import type React from "react";
import { motion } from 'framer-motion';
import GoogleIcon from '@mui/icons-material/Google';

import { useForm } from "react-hook-form";
import { OctagonAlertIcon, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Alert, AlertTitle } from "@/src/components/ui/alert";
import { authClient } from "@/src/lib/auth-client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { FiGithub } from "react-icons/fi";
import { SiteLogo } from '@/src/components/ui/site-logo';

const formSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email(),
    password: z.string().min(1, { message: "Password is required" }),
    confirmPassword: z.string().min(1, { message: "Password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords dont match",
    path: ["confirmPassword"],
  });

export const SignupForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setError(null);
    setPending(true);

    authClient.signUp.email(
      {
        name: data.name,
        email: data.email,
        password: data.password,

        callbackURL: "/",
      },
      {
        onSuccess: () => {
          setPending(false);
        },
        onError: ({ error }) => {
          setError(error.message);
          setPending(false);
        },
      }
    );
  };

  const onSocial = (provider: "github" | "google") => {
    setError(null);
    setPending(true);

    authClient.signIn.social(
      {
        provider: provider,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          setPending(false);
        },
        onError: ({ error }) => {
          setError(error.message);
          setPending(false);
        },
      }
    );
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <div className="relative">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#1F2937]">Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="John Doe"
                        className="border-gray-200 focus:ring-[#7C3AED] focus:border-[#7C3AED]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="relative">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#1F2937]">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        className="border-gray-200 focus:ring-[#7C3AED] focus:border-[#7C3AED]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="relative">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#1F2937]">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="border-gray-200 focus:ring-[#7C3AED] focus:border-[#7C3AED] pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#7C3AED] transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="relative">
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#1F2937]">Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="border-gray-200 focus:ring-[#7C3AED] focus:border-[#7C3AED]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {!!error && (
            <Alert className='bg-red-50 border-red-200'>
              <OctagonAlertIcon className='h-4 w-4 text-red-600' />
              <AlertTitle className='text-red-700'>{error}</AlertTitle>
            </Alert>
          )}
          {message ? (
            <p
              className="text-sm text-red-600"
              role="status"
              aria-live="polite"
            >
              {message}
            </p>
          ) : null}

          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.99 }}
          >
            <Button type="submit" className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white" disabled={pending}>
              {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {pending ? "Creating account..." : "Sign up"}
            </Button>
          </motion.div>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[#f9f8f0] px-2 text-xs uppercase tracking-wide text-gray-500">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <motion.div
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.99 }}
        >
          <Button
            type="button"
            variant="outline"
            className="w-full bg-[#E0F2FE] border-[#06B6D4] text-[#1F2937] hover:bg-[#B3E5FC]"
            onClick={() => onSocial("google")}
          >
            <GoogleIcon />
            {"Google"}
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.99 }}
        >
          <Button
            type="button"
            variant="outline"
            className="w-full bg-[#E0F2FE] border-[#06B6D4] text-[#1F2937] hover:bg-[#B3E5FC]"
            onClick={() => onSocial("github")}
          >
            <FiGithub />
            {"GitHub"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
