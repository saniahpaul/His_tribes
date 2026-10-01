import { createFileRoute } from "@tanstack/react-router";
import { Reading } from "@/components/screens";
export const Route = createFileRoute("/reading")({ head:()=>({meta:[{title:"Bible Reading — his_tribes"},{name:"description",content:"Bible Reading in the his_tribes Christian youth community."},{property:"og:title",content:"Bible Reading — his_tribes"},{property:"og:description",content:"Bible Reading for the his_tribes community."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}), component: Reading });
