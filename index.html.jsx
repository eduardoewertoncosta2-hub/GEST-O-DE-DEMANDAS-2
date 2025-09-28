import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Filter, Calendar as CalendarIcon, Flag, MoreHorizontal, X, ImagePlus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Tipos
const STATUS = ["Em andamento", "Aprovação", "Gráfica", "Concluída"] as const;
const PRIORIDADES = ["Alta", "Média", "Baixa"] as const;

function clsx(...c) { return c.filter(Boolean).join(" "); }

function prioridadeClass(p) {
  switch (p) {
    case "Alta":
      return "bg-red-100 text-red-700 border-red-200";
    case "Média":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "Baixa":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function statusClass(s) {
  switch (s) {
    case "Em andamento":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "Aprovação":
      return "bg-violet-100 text-violet-700 border-violet-200";
    case "Gráfica":
      return "bg-cyan-100 text-cyan-700 border-cyan-200";
    case "Concluída":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function daysLeft(inicio, fim) {
  if (!fim) return null;
  const now = new Date();
  const end = new Date(fim);
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return diff;
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { }
}
function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}

const initialSeeds = [
  {
    id: crypto.randomUUID(),
    titulo: "Campanha Outubro Rosa — KV + Peças Digitais",
    prioridade: "Alta",
    status: "Em andamento",
    inicio: new Date().toISOString().slice(0,10),
    fim: "",
    briefing: "Criar conceito base do KV, 3 variações e desdobrar em posts/carrossel. Alinhar tom mais humano e informativo.",
    referencias: ["https://images.unsplash.com/photo-1520975940462-42d33e04e6f6?q=80&w=800&auto=format&fit=crop"],
  },
  {
    id: crypto.randomUUID(),
    titulo: "Folder institucional — revisão e fechamento",
    prioridade: "Média",
    status: "Aprovação",
    inicio: new Date(Date.now()-86400000*2).toISOString().slice(0,10),
    fim: new Date(Date.now()+86400000*5).toISOString().slice(0,10),
    briefing: "Atualizar dados, revisar ortografia, exportar para gráfica (sangria 3mm)",
    referencias: [],
  },
  {
    id: crypto.randomUUID(),
    titulo: "Identidade Visual — Nexia Consultoria",
    prioridade: "Alta",
    status: "Gráfica",
    inicio: new Date(Date.now()-86400000*10).toISOString().slice(0,10),
    fim: new Date(Date.now()+86400000*1).toISOString().slice(0,10),
    briefing: "Fechar manual com aplicações e arquivos finais.",
    referencias: [
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?q=80&w=800&auto=format&fit=crop",
    ],
  },
];

export default function DemandasApp() {
  const [demandas, setDemandas] = useState(() => load("demandas", initialSeeds));
  const [query, setQuery] = useState("");
  const [fStatus, setFStatus] = useState("Todos");
  const [fPrioridade, setFPrioridade] = useState("Todas");
  const [ordemAsc, setOrdemAsc] = useState(true);
  const [openSheet, setOpenSheet] = useState(false);
  const [selecionada, setSelecionada] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => { save("demandas", demandas); }, [demandas]);

  const filtradas = useMemo(() => {
    let res = [...demandas];
    if (query.trim()) {
      const q = query.toLowerCase();
      res = res.filter(d => (d.titulo + " " + d.briefing).toLowerCase().includes(q));
    }
    if (fStatus !== "Todos") res = res.filter(d => d.status === fStatus);
    if (fPrioridade !== "Todas") res = res.filter(d => d.prioridade === fPrioridade);
    res.sort((a,b) => {
      const da = a.fim || ""; const db = b.fim || "";
      return ordemAsc ? da.localeCompare(db) : db.localeCompare(da);
    });
    return res;
  }, [demandas, query, fStatus, fPrioridade, ordemAsc]);

  function novaDemandaTemplate() {
    return {
      id: crypto.randomUUID(),
      titulo: "",
      prioridade: "Média",
      status: "Em andamento",
      inicio: new Date().toISOString().slice(0,10),
      fim: "",
      briefing: "",
      referencias: [],
    };
  }

  function abrirDemanda(d) {
    setSelecionada(d);
    setOpenSheet(true);
  }

  function atualizarSelecionada(patch) {
    setSelecionada(prev => ({ ...prev, ...patch }));
    setDemandas(prev => prev.map(d => d.id === selecionada.id ? { ...d, ...patch } : d));
  }

  function criarDemanda(d) {
    setDemandas(prev => [d, ...prev]);
  }

  function removerDemanda(id) {
    setDemandas(prev => prev.filter(d => d.id !== id));
    if (selecionada?.id === id) setOpenSheet(false);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="mx-auto max-w-7xl">
        {/* Cabeçalho */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Fluxo de Demandas</h1>
            <p className="text-slate-500">Estilo Monday, com visual limpo e foco em produtividade.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setOpenDialog(true)} className="rounded-2xl px-4">
              <Plus className="mr-2 h-4 w-4"/> Nova Demanda
            </Button>
          </div>
        </div>

        {/* Filtros & Busca */}
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                <Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por título ou briefing..." className="pl-9 rounded-xl"/>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400"/>
                <Select value={fStatus} onValueChange={setFStatus}>
                  <SelectTrigger className="w-[160px] rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos os status</SelectItem>
                    {STATUS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={fPrioridade} onValueChange={setFPrioridade}>
                  <SelectTrigger className="w-[160px] rounded-xl"><SelectValue placeholder="Prioridade" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todas">Todas</SelectItem>
                    {PRIORIDADES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Button variant="outline" className="rounded-xl" onClick={()=>setOrdemAsc(v=>!v)}>
                  <CalendarIcon className="h-4 w-4 mr-2"/>{ordemAsc?"Prazo ↑":"Prazo ↓"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Demandas */}
        <div className="mt-6 grid grid-cols-1 gap-3">
          <AnimatePresence>
            {filtradas.map((d) => (
              <motion.div key={d.id} initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-8}}>
                <Card className="rounded-2xl border-slate-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-3">
                        <Flag className="mt-1 h-4 w-4 text-slate-400"/>
                        <div>
                          <button onClick={()=>abrirDemanda(d)} className="text-left">
                            <h3 className="text-base md:text-lg font-medium leading-tight hover:underline">{d.titulo || <span className="text-slate-400">(Sem título)</span>}</h3>
                          </button>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <Badge className={clsx("border", prioridadeClass(d.prioridade))}>{d.prioridade}</Badge>
                            <Badge className={clsx("border", statusClass(d.status))}>{d.status}</Badge>
                            {d.inicio && (
                              <div className="inline-flex items-center gap-1 text-xs text-slate-500">
                                <CalendarIcon className="h-3 w-3"/> Início: {d.inicio}
                              </div>
                            )}
                            {d.fim && (
                              <div className="inline-flex items-center gap-1 text-xs text-slate-500">
                                <CalendarIcon className="h-3 w-3"/> Fim: {d.fim}
                              </div>
                            )}
                            {typeof daysLeft(d.inicio, d.fim) === 'number' && (
                              <span className={clsx(
                                "text-xs px-2 py-0.5 rounded-full border",
                                daysLeft(d.inicio, d.fim) < 0 ? "bg-rose-50 text-rose-700 border-rose-200" :
                                daysLeft(d.inicio, d.fim) <= 2 ? "bg-amber-50 text-amber-700 border-amber-200" :
                                "bg-emerald-50 text-emerald-700 border-emerald-200"
                              )}>
                                {daysLeft(d.inicio, d.fim) < 0 ? `Atrasada por ${Math.abs(daysLeft(d.inicio, d.fim))}d` : `${daysLeft(d.inicio, d.fim)}d restantes`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" className="rounded-xl" onClick={()=>abrirDemanda(d)}>Abrir</Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-xl"><MoreHorizontal className="h-4 w-4"/></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={()=>abrirDemanda(d)}>Editar</DropdownMenuItem>
                            <DropdownMenuItem className="text-rose-600" onClick={()=>removerDemanda(d.id)}>
                              <Trash2 className="h-4 w-4 mr-2"/> Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Dialog Nova Demanda */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="max-w-xl rounded-2xl">
            <DialogHeader>
              <DialogTitle>Nova Demanda</DialogTitle>
            </DialogHeader>
            <NovaDemandaForm onCreate={(d)=>{ criarDemanda(d); setOpenDialog(false); abrirDemanda(d); }} onCancel={()=>setOpenDialog(false)} template={novaDemandaTemplate()} />
          </DialogContent>
        </Dialog>

        {/* Sheet Detalhes */}
        <Sheet open={openSheet} onOpenChange={setOpenSheet}>
          <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto rounded-l-2xl">
            {selecionada && (
              <div className="space-y-6 py-4">
                <SheetHeader>
                  <SheetTitle>
                    <InlineEditText
                      value={selecionada.titulo}
                      placeholder="Título da demanda"
                      onChange={(v)=>atualizarSelecionada({titulo:v})}
                    />
                  </SheetTitle>
                  <SheetDescription>Briefing, referências, prazos, prioridade e status.</SheetDescription>
                </SheetHeader>

                <Secao colapsavel titulo="Informações Gerais" icone={<Flag className="h-4 w-4"/>}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Classificação de Prioridade</Label>
                      <Select value={selecionada.prioridade} onValueChange={(v)=>atualizarSelecionada({prioridade:v})}>
                        <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PRIORIDADES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select value={selecionada.status} onValueChange={(v)=>atualizarSelecionada({status:v})}>
                        <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Data de início</Label>
                      <Input type="date" className="rounded-xl mt-1" value={selecionada.inicio || ""} onChange={e=>atualizarSelecionada({inicio:e.target.value})}/>
                    </div>
                    <div>
                      <Label>Possível término</Label>
                      <Input type="date" className="rounded-xl mt-1" value={selecionada.fim || ""} onChange={e=>atualizarSelecionada({fim:e.target.value})}/>
                    </div>
                  </div>
                </Secao>

                <Secao colapsavel titulo="Briefing" icone={<EditIcon/>}>
                  <Textarea className="min-h-[140px] rounded-xl" placeholder="Descreva o briefing em texto..." value={selecionada.briefing} onChange={e=>atualizarSelecionada({briefing:e.target.value})}/>
                </Secao>

                <Secao colapsavel titulo="Referências (imagens)" icone={<ImagePlus className="h-4 w-4"/>}>
                  <Referencias imagens={selecionada.referencias} onAdd={(url)=>atualizarSelecionada({referencias:[...selecionada.referencias, url]})} onRemove={(idx)=>{
                    const novo = selecionada.referencias.filter((_,i)=>i!==idx); atualizarSelecionada({referencias: novo});
                  }}/>
                </Secao>

                <div className="pt-2 flex items-center justify-between border-t">
                  <div className="flex items-center gap-2">
                    <Badge className={clsx("border", prioridadeClass(selecionada.prioridade))}>{selecionada.prioridade}</Badge>
                    <Badge className={clsx("border", statusClass(selecionada.status))}>{selecionada.status}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl" onClick={()=>setOpenSheet(false)}>Fechar</Button>
                    <Button className="rounded-xl" onClick={()=>setOpenSheet(false)}>Salvar</Button>
                  </div>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

function InlineEditText({ value, onChange, placeholder }){
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value || "");
  useEffect(()=>setVal(value || ""), [value]);
  return (
    <div>
      {editing ? (
        <input autoFocus className="w-full bg-transparent border-b border-slate-300 focus:outline-none focus:border-slate-400 py-1" value={val} placeholder={placeholder} onChange={e=>setVal(e.target.value)} onBlur={()=>{ onChange(val); setEditing(false); }} onKeyDown={(e)=>{ if(e.key==='Enter'){ onChange(val); setEditing(false); } }} />
      ) : (
        <button className="text-left" onClick={()=>setEditing(true)}>
          <span className={clsx("font-medium", !value && "text-slate-400")}>{value || placeholder}</span>
        </button>
      )}
    </div>
  );
}

function Secao({ titulo, children, icone, colapsavel=true }){
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-2xl border p-4">
      <button onClick={()=>colapsavel && setOpen(o=>!o)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icone}
          <h3 className="text-sm font-semibold">{titulo}</h3>
        </div>
        {colapsavel && (open ? <ChevronUp className="h-4 w-4 text-slate-400"/> : <ChevronDown className="h-4 w-4 text-slate-400"/>) }
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{height:0, opacity:0}} animate={{height:"auto", opacity:1}} exit={{height:0, opacity:0}} className="pt-4">
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Referencias({ imagens, onAdd, onRemove }){
  const [url, setUrl] = useState("");
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input value={url} onChange={e=>setUrl(e.target.value)} placeholder="Cole uma URL de imagem (https://...)" className="rounded-xl"/>
        <Button className="rounded-xl" onClick={()=>{ if(url.trim()) { onAdd(url.trim()); setUrl(""); } }}>Adicionar</Button>
      </div>
      {imagens?.length ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {imagens.map((src, idx)=> (
            <div key={idx} className="relative group">
              <img src={src} alt="referência" className="h-28 w-full object-cover rounded-xl border"/>
              <button onClick={()=>onRemove(idx)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur rounded-full p-1 border"><X className="h-4 w-4"/></button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">Nenhuma imagem adicionada ainda.</p>
      )}
    </div>
  );
}

function NovaDemandaForm({ onCreate, onCancel, template }){
  const [form, setForm] = useState(template);
  function setField(k, v){ setForm(prev => ({...prev, [k]: v})); }
  return (
    <div className="space-y-4">
      <div>
        <Label>Título</Label>
        <Input className="rounded-xl mt-1" value={form.titulo} onChange={e=>setField("titulo", e.target.value)} placeholder="Ex.: Landing page campanha X"/>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Prioridade</Label>
          <Select value={form.prioridade} onValueChange={(v)=>setField("prioridade", v)}>
            <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PRIORIDADES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v)=>setField("status", v)}>
            <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Início</Label>
          <Input type="date" className="rounded-xl mt-1" value={form.inicio} onChange={e=>setField("inicio", e.target.value)} />
        </div>
        <div>
          <Label>Possível término</Label>
          <Input type="date" className="rounded-xl mt-1" value={form.fim} onChange={e=>setField("fim", e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Briefing</Label>
        <Textarea className="rounded-xl mt-1 min-h-[120px]" value={form.briefing} onChange={e=>setField("briefing", e.target.value)} placeholder="Contexto, objetivos, entregáveis, restrições..."/>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" className="rounded-xl" onClick={onCancel}>Cancelar</Button>
        <Button className="rounded-xl" onClick={()=>onCreate(form)} disabled={!form.titulo.trim()}>Criar</Button>
      </div>
    </div>
  );
}

function EditIcon(){
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
  );
}
