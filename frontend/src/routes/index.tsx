import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/screens";
export const Route = createFileRoute("/")({ head:()=>({meta:[{title:"Youth Dashboard — his_tribes"},{name:"description",content:"Track Bible reading, prayer, and community progress in his_tribes."},{property:"og:title",content:"Youth Dashboard — his_tribes"},{property:"og:description",content:"A peaceful Christian youth community dashboard."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}), component: Dashboard });
