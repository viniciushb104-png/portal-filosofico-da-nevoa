import { pipeline, env, TextStreamer } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0";

env.allowLocalModels = false;
env.useBrowserCache = true;

const MODEL_ID = "onnx-community/Qwen2.5-0.5B-Instruct";
let generatorPromise = null;

function progressLabel(p){
  if(!p || typeof p !== "object") return "Despertando a consciência da névoa…";
  if(p.status === "initiate") return "Abrindo o grimório da IA local…";
  if(p.status === "download"){
    const pct = Number.isFinite(p.progress) ? Math.round(p.progress) : null;
    return pct === null ? "Baixando memórias da névoa…" : "Baixando memórias da névoa… " + pct + "%";
  }
  if(p.status === "progress"){
    const pct = Number.isFinite(p.progress) ? Math.round(p.progress) : null;
    return pct === null ? "Organizando pensamentos…" : "Organizando pensamentos… " + pct + "%";
  }
  if(p.status === "done") return "Memória carregada.";
  return "Despertando a consciência da névoa…";
}

async function getGenerator(){
  if(!self.navigator || !self.navigator.gpu) throw new Error("webgpu_unavailable");
  if(!generatorPromise){
    generatorPromise = pipeline("text-generation", MODEL_ID, {
      dtype: "q4",
      device: "webgpu",
      progress_callback: p => self.postMessage({type:"progress", label:progressLabel(p), progress:p && p.progress != null ? p.progress : null})
    }).then(g=>{
      self.postMessage({type:"ready"});
      return g;
    }).catch(err=>{
      generatorPromise = null;
      throw err;
    });
  }
  return generatorPromise;
}

function cleanReply(text){
  return String(text||"")
    .replace(/<\/?think>/gi,"")
    .replace(/^\s*(assistant|amigo da névoa)\s*:\s*/i,"")
    .trim();
}

self.onmessage = async event => {
  const data = event.data || {};
  if(data.type === "preload"){
    try{ await getGenerator(); }catch(err){ self.postMessage({type:"preload_error",error:String((err&&err.message)||err||"preload_error")}); }
    return;
  }
  if(data.type !== "generate") return;
  const id = data.id;
  try{
    const generator = await getGenerator();
    const streamer = new TextStreamer(generator.tokenizer, {
      skip_prompt:true,
      skip_special_tokens:true,
      callback_function:text=>self.postMessage({type:"chunk",id,text})
    });
    const messages = [
      {role:"system", content:data.system},
      ...(Array.isArray(data.history) ? data.history.slice(-8) : []),
      {role:"user", content:data.message}
    ];
    const output = await generator(messages, {
      max_new_tokens: 105,
      do_sample: true,
      temperature: 0.68,
      top_p: 0.84,
      repetition_penalty: 1.10,
      streamer
    });
    const generated = output && output[0] ? output[0].generated_text : null;
    let reply = Array.isArray(generated) ? (generated.at(-1) && generated.at(-1).content) : generated;
    reply = cleanReply(reply);
    if(!reply) throw new Error("empty_generation");
    self.postMessage({type:"result", id, reply});
  }catch(err){
    self.postMessage({type:"error", id, error:String((err && err.message) || err || "local_ai_error")});
  }
};
