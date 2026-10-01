import { createFileRoute } from "@tanstack/react-router";
import { Journal } from "@/components/screens";
export const Route = createFileRoute("/journal")({ head:()=>({meta:[{title:"SOAP Journal — his_tribes"},{name:"description",content:"SOAP Journal in the his_tribes Christian youth community."},{property:"og:title",content:"SOAP Journal — his_tribes"},{property:"og:description",content:"SOAP Journal for the his_tribes community."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}), component: Journal });
