import { createFileRoute } from "@tanstack/react-router";
import { Prayers } from "@/components/screens";
export const Route = createFileRoute("/prayers")({ head:()=>({meta:[{title:"Prayer Requests — his_tribes"},{name:"description",content:"Prayer Requests in the his_tribes Christian youth community."},{property:"og:title",content:"Prayer Requests — his_tribes"},{property:"og:description",content:"Prayer Requests for the his_tribes community."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}), component: Prayers });
