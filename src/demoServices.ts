/** Demo seams for replacing local state with authenticated API calls later. */
export const demoStorage={
  read<T>(key:string,fallback:()=>T):T{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw) as T:fallback()}catch{return fallback()}},
  write<T>(key:string,value:T){try{localStorage.setItem(key,JSON.stringify(value))}catch{window.dispatchEvent(new Event('boro:storage-full'))}}
};
export const demoAuth={selectAccount(id:string){return id}};
export const demoPayments={completeCheckout(_amount:number){return true}};
