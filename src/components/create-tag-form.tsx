import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Check, Loader2, X } from "lucide-react";
import { Button } from "./ui/button";

//Validação de formulários com Zod:
const createTagSchema = z.object({
  title: z.string().min(3, { message: "Minimum 3 characters!" }),
});
//Criando inferência (tipando uma variável já existente) com o zod infer:
type CreateTagSchema = z.infer<typeof createTagSchema>;

//Formatando formato do slug seguindo os critérios: Sem acentuação, sem espaços vazios, sm símbolos
function getSlugFromString(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-");
}

export function CreateTagForm() {
  const queryClient = useQueryClient();

  //useForm para lidar com formulários:
  //zodResolver vai fazer a ligação do zod com o useForm.
  //"register" vai fazer o registro do input.
  //"handleSubmit" pega uma função e a usa para lidar com formulários.
  const { register, handleSubmit, watch, formState } = useForm<CreateTagSchema>(
    {
      resolver: zodResolver(createTagSchema),
    }
  );

  //Recebendo o slug observando o "name", com o "watch", disponível no useForm.
  const slug = watch("title") ? getSlugFromString(watch("title")) : "";

  //Criando a tag na tela com useMutation:
  const { mutateAsync } = useMutation({
    mutationFn: async ({ title }: CreateTagSchema) => {
      //Delay de 2 segundos
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await fetch("http://localhost:3333/tags", {
        method: "POST",
        body: JSON.stringify({
          title,
          slug,
          amountOfVideos: 0,
        }),
      });
    },
    //"queryClient.invalidateQueries" para invalidar uma consulta específica no cache do React Query. Isso é útil para garantir que os dados sejam atualizados após uma mutação bem-sucedida.
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-tags"],
      });
    },
  });

  async function createTag({ title }: CreateTagSchema) {
    await mutateAsync({ title });
  }

  return (
    <form onSubmit={handleSubmit(createTag)} className="w-full space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium block" htmlFor="title">
          Tag Title
        </label>
        <input
          {...register("title")}
          id="title"
          type="text"
          className="text-sm border border-zinc-800 outline-none rounded-lg px-3 py-2 bg-zinc-800/50 w-full"
        />
        {formState.errors?.title && (
          <p className="font-medium text-sm text-red-400">
            {formState.errors.title.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium block" htmlFor="slug">
          Slug
        </label>
        <input
          id="slug"
          type="text"
          readOnly
          value={slug}
          className="border border-zinc-800 outline-none rounded-lg px-3 py-2 bg-zinc-800/50 w-full"
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <Dialog.Close asChild>
          <Button>
            <X className="size-3" />
            Cancel
          </Button>
        </Dialog.Close>
        <Button
          disabled={formState.isSubmitting}
          className="bg-teal-400 text-teal-950 font-semibold"
          type="submit"
        >
          {formState.isSubmitting ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Check className="size-3" />
          )}
          Save
        </Button>
      </div>
    </form>
  );
}
