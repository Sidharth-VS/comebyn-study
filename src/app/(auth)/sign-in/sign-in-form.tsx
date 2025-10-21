"use client"

import type React from "react"
import { motion } from "framer-motion";

import { useState } from "react";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from "next/link";
import { Loader2, OctagonAlertIcon } from "lucide-react";

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
            <div className="relative">
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

          <div className='grid gap-3'>
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
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={pending}>
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
          <span className="bg-white px-2 text-xs uppercase tracking-wide text-slate-500">Or continue with</span>
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
            className="w-full bg-transparent"
            onClick={() => onSocial("google")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M564 325.8C564 467.3 467.1 568 324 568C186.8 568 76 457.2 76 320C76 182.8 186.8 72 324 72C390.8 72 447 96.5 490.3 136.9L422.8 201.8C334.5 116.6 170.3 180.6 170.3 320C170.3 406.5 239.4 476.6 324 476.6C422.2 476.6 459 406.2 464.8 369.7L324 369.7L324 284.4L560.1 284.4C562.4 297.1 564 309.3 564 325.8z"/></svg>
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
            className="w-full bg-transparent" 
            onClick={() => onSocial("github")}
          >
            <svg viewBox="0 0 16 16" className="mr-2 h-4 w-4" aria-hidden="true">
              <path
                fill="currentColor"
                d="M8 0C3.58 0 0 3.73 0 8.337c0 3.685 2.292 6.806 5.47 7.911.4.077.546-.177.546-.394 0-.194-.007-.71-.011-1.394-2.226.5-2.695-1.095-2.695-1.095-.364-.95-.889-1.203-.889-1.203-.726-.511.055-.501.055-.501.803.058 1.225.844 1.225.844.714 1.257 1.873.894 2.329.684.073-.533.279-.894.508-1.1-1.777-.206-3.644-.914-3.644-4.066 0-.898.314-1.633.827-2.21-.083-.206-.358-1.036.078-2.16 0 0 .672-.219 2.2.844.639-.18 1.324-.27 2.005-.274.681.003 1.366.094 2.005.274 1.527-1.063 1.87 -.844 1.87-.844.437 1.124.162 1.954.08 2.16.515.577.826 1.312.826 2.21 0 3.161-1.87 3.857-3.651 4.059.287.253.543.753.543 1.518 0 1.096-.01 1.978-.01 2.247 0 .219.145.474.55.393C13.71 15.139 16 12.02 16 8.336 16 3.73 12.42 0 8 0Z"
              />
            </svg>
            {"GitHub"}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
