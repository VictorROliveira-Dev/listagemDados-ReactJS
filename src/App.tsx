import {
  PlusCircle,
  Search,
  FileDown,
  MoreHorizontal,
  Filter,
} from "lucide-react";
import { Header } from "./components/header";
import { Tabs } from "./components/tabs";
import { Button } from "./components/ui/button";
import { Control, Input } from "./components/ui/input";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
} from "./components/ui/table";
import * as Dialog from "@radix-ui/react-dialog";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Pagination } from "./components/pagination";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { CreateTagForm } from "./components/create-tag-form";

export interface TagResponse {
  first: number;
  prev: number | null;
  next: number;
  last: number;
  pages: number;
  items: number;
  data: Tag[];
}

export interface Tag {
  title: string;
  slug: string;
  amountOfVideos: number;
  id: string;
}

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlFilter = searchParams.get("filter") ?? "";

  const [filter, setFilter] = useState(urlFilter);

  //const debouncedFilter = useDebounceValue(filter, 1000);

  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
  //Uma vez que a página é carregada, o Query salva ela em cache, fazendo com que não necessite carrega-la novamente, otimizando a aplicação.
  const { data: tagsResponse, isLoading } = useQuery<TagResponse>({
    //Chave para diferenciar cada item por chamada da API:
    //Passando o item "page", para diferenciar cada página com uma key diferente:
    //Uma vez que a página é carregada, o queryKey salva ela em cache, fazendo com que não necessite carrega-la(requisita-la) novamente, otimizando a aplicação.
    //urlFilter filtrando os itens pela URL.
    queryKey: ["get-tags", urlFilter, page],
    //Função para realizar o get dos dados da API:
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:3333/tags?_page=${page}&_per_page=10&title=${urlFilter}`
      );
      const data = await response.json();
      //Adicionando delay de 2 segundos para a chamada:
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return data;
    },
    //Retirando o "piscar" da página enquanto se carrega os dados
    placeholderData: keepPreviousData,
    //Adicionando tempo para eliminar dados do cache: ex (60segundos)
    staleTime: 1000 * 60,
  });

  function handleFilter() {
    setSearchParams((params) => {
      params.set("page", "1");
      params.set("filter", filter);

      return params;
    });
  }

  if (isLoading) {
    return null;
  }

  return (
    <div className="py-10 space-y-8">
      <div>
        <Header />
        <Tabs />
      </div>
      <main className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Tags</h1>
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <Button variant="primary">
                <PlusCircle className="size-4" />
                Create New
              </Button>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/60" />
              <Dialog.Content className="fixed space-y-10 p-10 right-0 top-0 bottom-0 h-screen min-w-[320px] z-10 bg-zinc-950 bordr-l border-zinc-900">
                <div className="space-y-3">
                  <Dialog.Title className="text-xl font-bold">
                    Create Tag
                  </Dialog.Title>
                  <Dialog.Description className="text-sm text-zinc-500 font-normal"> 
                    Tags can be used to group vídeos about similar concepts.
                  </Dialog.Description>
                </div>
                
                <CreateTagForm />
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Input variant="filter">
              <Search className="size-3" />
              <Control
                placeholder="Search tags..."
                onChange={(e) => setFilter(e.target.value)}
                value={filter}
              />
            </Input>
            <Button onClick={handleFilter}>
              <Filter className="size-3" />
              Filter
            </Button>
          </div>

          <Button>
            <FileDown className="size-3" />
            Export
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Tag</TableHead>
              <TableHead>Amount of Videos</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tagsResponse?.data.map((tag) => {
              return (
                <TableRow key={tag.id}>
                  <TableCell></TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold">{tag.title}</span>
                      <span className="text-xs text-zinc-500 font-bold">{tag.slug}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {tag.amountOfVideos} Vídeo(s)
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {tagsResponse && (
          <Pagination
            pages={tagsResponse.pages}
            items={tagsResponse.items}
            page={page}
          />
        )}
      </main>
    </div>
  );
}
