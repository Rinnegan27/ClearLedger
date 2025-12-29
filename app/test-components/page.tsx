"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";
import { Modal, ConfirmModal } from "@/components/ui/modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonButton,
} from "@/components/ui/skeleton";
import { PasswordStrength } from "@/components/ui/password-strength";
import { signUpSchema } from "@/lib/validations/auth";
import { MoreVertical, Info } from "lucide-react";

export default function TestComponentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [password, setPassword] = useState("");

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  const onSubmit = (data: z.infer<typeof signUpSchema>) => {
    toast.success("Form submitted!", "Your form data has been validated successfully.");
    console.log(data);
  };

  return (
    <TooltipProvider delayDuration={400}>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Phase 1 Components Test
            </h1>
            <p className="mt-2 text-gray-600">
              Testing all components from Phase 1 implementation
            </p>
          </div>

          {/* Toast Notifications */}
          <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Toast Notifications
            </h2>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() =>
                  toast.success("Success!", "This is a success message")
                }
                variant="default"
              >
                Success Toast
              </Button>
              <Button
                onClick={() => toast.error("Error!", "This is an error message")}
                variant="destructive"
              >
                Error Toast
              </Button>
              <Button
                onClick={() =>
                  toast.warning("Warning!", "This is a warning message")
                }
                variant="secondary"
              >
                Warning Toast
              </Button>
              <Button
                onClick={() => toast.info("Info!", "This is an info message")}
                variant="outline"
              >
                Info Toast
              </Button>
              <Button
                onClick={() =>
                  toast.action("Action needed", {
                    description: "Click the button to continue",
                    actionLabel: "Continue",
                    onAction: () => alert("Action clicked!"),
                  })
                }
                variant="outline"
              >
                Action Toast
              </Button>
            </div>
          </section>

          {/* Modal/Dialog */}
          <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Modal & Dialog
            </h2>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
              <Button
                onClick={() => setIsConfirmModalOpen(true)}
                variant="destructive"
              >
                Open Confirm Modal
              </Button>
            </div>

            <Modal
              open={isModalOpen}
              onOpenChange={setIsModalOpen}
              title="Example Modal"
              description="This is a modal dialog component"
              footer={
                <>
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsModalOpen(false)}>Confirm</Button>
                </>
              }
            >
              <p className="text-gray-600">
                This is the modal content. You can put any content here.
              </p>
            </Modal>

            <ConfirmModal
              open={isConfirmModalOpen}
              onOpenChange={setIsConfirmModalOpen}
              title="Confirm Action"
              description="Are you sure you want to perform this action?"
              variant="danger"
              confirmLabel="Delete"
              onConfirm={() => {
                toast.success("Confirmed!", "Action was confirmed");
              }}
            />
          </section>

          {/* Dropdown Menu */}
          <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Dropdown Menu
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => toast.info("Edit clicked")}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("Duplicate clicked")}>
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  destructive
                  onClick={() => toast.error("Delete clicked")}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </section>

          {/* Tooltip */}
          <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900">Tooltips</h2>
            <div className="flex flex-wrap gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">
                    <Info className="mr-2 h-4 w-4" />
                    Hover me (top)
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>This is a tooltip on top</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">
                    <Info className="mr-2 h-4 w-4" />
                    Hover me (right)
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>This is a tooltip on the right</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">
                    <Info className="mr-2 h-4 w-4" />
                    Hover me (bottom)
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>This is a tooltip on the bottom</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </section>

          {/* Form Components */}
          <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Form Validation
            </h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter your full name (at least 2 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setPassword(e.target.value);
                          }}
                        />
                      </FormControl>
                      <PasswordStrength password={password} />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Submit Form
                </Button>
              </form>
            </Form>
          </section>

          {/* Spinners */}
          <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Loading Spinners
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
              <Spinner size="xl" />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Spinner variant="default" label="Loading..." />
              <Spinner variant="secondary" label="Processing..." />
            </div>
          </section>

          {/* Skeletons */}
          <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Skeleton Loaders
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Text skeleton:</p>
                <SkeletonText />
                <SkeletonText className="w-3/4" />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Card skeleton:</p>
                <SkeletonCard />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Avatar skeleton:</p>
                <SkeletonAvatar />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Button skeleton:</p>
                <SkeletonButton />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Custom skeleton:</p>
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </TooltipProvider>
  );
}
