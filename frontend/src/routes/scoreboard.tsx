import { createFileRoute } from "@tanstack/react-router";
import { Scoreboard } from "@/components/screens";
export const Route = createFileRoute("/scoreboard")({ head:()=>({meta:[{title:"Scoreboard — his_tribes"},{name:"description",content:"Scoreboard in the his_tribes Christian youth community."},{property:"og:title",content:"Scoreboard — his_tribes"},{property:"og:description",content:"Scoreboard for the his_tribes community."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}), component: Scoreboard });
