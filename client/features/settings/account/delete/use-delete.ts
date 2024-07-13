import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useToast } from "@/features/ui/use-toast";
import { useRouter } from "next/navigation";
import { deleteAccount } from "./delete-account";
import { AxiosError } from "axios";

const formSchema = z.object({
  password: z.string().min(1, { message: "Password is required" }),
});

export const useDeleteAccount = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  const onDialogOpen = () => setIsDialogOpen(true);
  const onDialogClose = () => {
    setIsDialogOpen(false);
    form.reset();
  };

  const onSubmit = async ({ password }: z.infer<typeof formSchema>) => {
    setLoading(true);
    setTimeout(async () => {
      try {
        await deleteAccount(password);
        toast({
          variant: "success",
          title: "Delete account successfully",
        });
        form.reset();
        router.replace("/");
        router.refresh();
      } catch (error: any) {
        toast({
          variant: "error",
          title: "Delete account failed!",
          description:
            error instanceof AxiosError
              ? error.response?.data.message
              : error.message,
        });
      } finally {
        setLoading(false);
      }
    }, 2000);
  };
  return { loading, form, onSubmit, isDialogOpen, onDialogClose, onDialogOpen };
};
