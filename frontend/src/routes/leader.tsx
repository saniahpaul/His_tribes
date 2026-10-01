import { createFileRoute } from "@tanstack/react-router";
import { Leader } from "@/components/screens";
export const Route = createFileRoute("/leader")({ head:()=>({meta:[{title:"Leader Dashboard — his_tribes"},{name:"description",content:"Leader Dashboard in the his_tribes Christian youth community."},{property:"og:title",content:"Leader Dashboard — his_tribes"},{property:"og:description",content:"Leader Dashboard for the his_tribes community."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}), component: Leader });
