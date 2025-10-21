"use client"

import type React from "react"
import { motion } from "framer-motion";

import { useState } from "react";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from "next/link";
import { Loader2, OctagonAlertIcon } from "lucide-react";
import GoogleIcon from '@mui/icons-material/Google';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/src/components/ui/form';
import { Alert, AlertTitle } from '@/src/components/ui/alert';
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { authClient } from '@/src/lib/auth-client';
import { FiGithub } from "react-icons/fi";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: 'Password is required' })
})

export const LoginForm = () => {
  const [ error, setError ] = useState<string | null>(null);
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async(data: z.infer<typeof formSchema>) => {
    setError(null);
    setPending(true);

    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,

        callbackURL: '/',
      },
      {
        onSuccess: () => {
          setPending(false);
        },
        onError: ({ error }) => {
          setError(error.message);
          setPending(false);
        }
      }
    );
  };

  const onSocial = (provider: "github" | "google") => {
    setError(null);
    setPending(true);

    authClient.signIn.social(
      {
        provider: provider,
        callbackURL: '/',
      },
      {
        onSuccess: () => {
          setPending(false);
        },
        onError: ({ error }) => {
          setError(error.message);
          setPending(false);
        }
      }
    );
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <div className="relative text-[#6d34ca]">
              <FormField 
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                          type='email'
                          placeholder='name@example.com'
                          {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className='grid gap-3 text-[#6d34ca]'>
            <FormField 
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                        type='password'
                        placeholder='********'
                        {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {!!error && (
            <Alert className='bg-destructive/10 border-none'>
              <OctagonAlertIcon className='h-4 w-4 !text-destructive'/>
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}
          {message ? (
            <p className="text-sm text-red-600" role="status" aria-live="polite">
              {message}
            </p>
          ) : null}

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                name="remember"
                defaultChecked={false}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                aria-label="Remember me"
              />
              {"Remember me"}
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-sky-700 underline underline-offset-4 hover:text-sky-800"
            >
              {"Forgot password?"}
            </Link>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.99 }}
          >
            <Button type="submit" className="w-full bg-[#8056c3] hover:bg-[#6232ae]" disabled={pending}>
              {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {pending ? "Signing in..." : "Sign in"}
            </Button>
          </motion.div>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-2 text-xs uppercase tracking-wide text-slate-500 bg-slate-50">Or continue with</span>
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
            className="w-full bg-[#F3C5FF] hover:bg-[#d29ce0]"
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
            className="w-full bg-[#F3C5FF] hover:bg-[#d29ce0]" 
            onClick={() => onSocial("github")}
          >
            <FiGithub />
            {"GitHub"}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
