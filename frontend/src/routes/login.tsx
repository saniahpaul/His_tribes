import { createFileRoute } from "@tanstack/react-router";
import { Login } from "@/components/screens";
export const Route = createFileRoute("/login")({ head:()=>({meta:[{title:"Login — his_tribes"},{name:"description",content:"Login in the his_tribes Christian youth community."},{property:"og:title",content:"Login — his_tribes"},{property:"og:description",content:"Login for the his_tribes community."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}), component: Login });
