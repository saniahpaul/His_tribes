import { createFileRoute } from "@tanstack/react-router";
import { History } from "@/components/screens";
export const Route = createFileRoute("/history")({ head:()=>({meta:[{title:"Reading History — his_tribes"},{name:"description",content:"Reading History in the his_tribes Christian youth community."},{property:"og:title",content:"Reading History — his_tribes"},{property:"og:description",content:"Reading History for the his_tribes community."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}), component: History });
