import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Gift, Users, CheckCircle, XCircle } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { ProgressCircle } from "@/components/ui/progress-circle";

// Preço médio por pacote de fraldas
const PRECO_PACOTE_FRALDA = 50;

// Tamanhos de fraldas disponíveis
const TAMANHOS_FRALDA = ["P", "M", "G", "XG", "XXG"];

export default async function PresentesPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  // Buscar todos os convidados com seus tamanhos de fralda e status de confirmação
  const convidados = await prisma.guest.findMany({
    include: {
      confirmation: true,
    },
  });

  // Inicializar contadores
  const resumoFraldas = {
    total: {
      confirmadas: 0,
      pendentes: 0,
      total: 0,
    },
    porTamanho: {} as Record<string, { confirmadas: number; pendentes: number; total: number }>,
  };

  // Inicializar contadores por tamanho
  TAMANHOS_FRALDA.forEach(tamanho => {
    resumoFraldas.porTamanho[tamanho] = {
      confirmadas: 0,
      pendentes: 0,
      total: 0,
    };
  });

  // Calcular totais
  convidados.forEach(convidado => {
    // Só contabilizar se tiver tamanho de fralda especificado
    if (convidado.giftSize && convidado.giftSize !== "nenhum") {
      const tamanho = convidado.giftSize;
      const quantidade = convidado.giftQuantity || 1;
      const confirmado = convidado.confirmation?.confirmed || false;

      // Inicializar o tamanho se não existir
      if (!resumoFraldas.porTamanho[tamanho]) {
        resumoFraldas.porTamanho[tamanho] = {
          confirmadas: 0,
          pendentes: 0,
          total: 0,
        };
      }

      if (confirmado) {
        resumoFraldas.porTamanho[tamanho].confirmadas += quantidade;
        resumoFraldas.total.confirmadas += quantidade;
      } else {
        resumoFraldas.porTamanho[tamanho].pendentes += quantidade;
        resumoFraldas.total.pendentes += quantidade;
      }
      
      resumoFraldas.porTamanho[tamanho].total += quantidade;
      resumoFraldas.total.total += quantidade;
    }
  });

  // Calcular valor total estimado
  const valorTotalEstimado = resumoFraldas.total.total * PRECO_PACOTE_FRALDA;
  const valorConfirmado = resumoFraldas.total.confirmadas * PRECO_PACOTE_FRALDA;
  const percentualConfirmado = resumoFraldas.total.total > 0 
    ? Math.round((resumoFraldas.total.confirmadas / resumoFraldas.total.total) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-purple-800">
          Presentes
        </h1>
        <p className="text-gray-500">
          Acompanhe as fraldas confirmadas e pendentes para o Chá da Antonella
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl">Total de Fraldas</CardTitle>
            <Gift className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{resumoFraldas.total.total}</div>
            <p className="text-sm text-gray-500">
              Fraldas serão presenteadas pelos convidados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl">Valor Estimado</CardTitle>
            <div className="text-purple-600 font-medium text-sm">R$ {PRECO_PACOTE_FRALDA}/pacote</div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ {valorTotalEstimado.toLocaleString('pt-BR')}</div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-sm text-gray-500">
                Confirmados: R$ {valorConfirmado.toLocaleString('pt-BR')}
              </p>
              <p className="text-sm font-medium text-green-600">
                {percentualConfirmado}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl">Status</CardTitle>
            <Users className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent className="flex justify-between items-center pt-2">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-green-600">{resumoFraldas.total.confirmadas}</span>
              <span className="text-xs text-gray-500">Confirmadas</span>
            </div>
            
            <div className="w-20 h-20">
              <ProgressCircle 
                value={percentualConfirmado} 
                size="lg"
              />
            </div>
            
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-orange-500">{resumoFraldas.total.pendentes}</span>
              <span className="text-xs text-gray-500">Pendentes</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fraldas por Tamanho</CardTitle>
          <CardDescription>
            Detalhamento das fraldas confirmadas e pendentes por tamanho
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tamanho</TableHead>
                <TableHead className="text-center">Confirmadas</TableHead>
                <TableHead className="text-center">Pendentes</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-right">Valor Estimado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(resumoFraldas.porTamanho)
                .filter(([_, { total }]) => total > 0)
                .sort(([a], [b]) => {
                  // Ordenar os tamanhos padrão em ordem específica
                  const index1 = TAMANHOS_FRALDA.indexOf(a);
                  const index2 = TAMANHOS_FRALDA.indexOf(b);
                  
                  if (index1 >= 0 && index2 >= 0) return index1 - index2;
                  if (index1 >= 0) return -1;
                  if (index2 >= 0) return 1;
                  return a.localeCompare(b);
                })
                .map(([tamanho, { confirmadas, pendentes, total }]) => (
                  <TableRow key={tamanho}>
                    <TableCell className="font-medium">{tamanho}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        {confirmadas}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1 text-orange-500">
                        <XCircle className="h-4 w-4" />
                        {pendentes}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">{total}</TableCell>
                    <TableCell className="text-right">
                      R$ {(total * PRECO_PACOTE_FRALDA).toLocaleString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Dicas para Presentes</CardTitle>
          <CardDescription>
            Informações úteis para ajudar os convidados na escolha dos presentes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Sobre os Tamanhos</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="font-medium">P:</span> 
                <span>Até 6kg (recém-nascido até 3 meses)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">M:</span> 
                <span>5kg a 10kg (2 a 7 meses)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">G:</span> 
                <span>9kg a 13kg (6 a 12 meses)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">XG:</span> 
                <span>12kg a 15kg (10 a 14 meses)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">XXG:</span> 
                <span>Acima de 14kg (a partir de 12 meses)</span>
              </li>
            </ul>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-purple-800 mb-2">Dicas para os Pais</h3>
            <p className="text-gray-700 mb-2">
              É recomendado ter mais fraldas dos tamanhos M e G, que são usados por um período mais longo.
              Tamanhos P geralmente são utilizados por apenas 2-3 meses.
            </p>
            <p className="text-gray-700">
              Cada pacote contém entre 40 e 50 fraldas, dependendo do tamanho. Os bebês usam em média 6-8 fraldas por dia nos primeiros meses.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 