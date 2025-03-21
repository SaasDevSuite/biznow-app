'use client'
import {PlanCard} from "@/components/app/plan-card";
import {useEffect, useState} from "react";
import {Plan} from "@/contexts/data/plan";
import {useRouter} from "next/navigation";


export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([])
    const route = useRouter()

    async function getPlans() {
        const res = await fetch('/api/plans/all', {
            method: 'GET',
        })
        const data = await res.json()
        setPlans(data)
    }

    useEffect(() => {
        getPlans()
    }, [])

    const handleSubscribe = async (planId: string) => {
        route.push(`/checkout/${planId}`)
    }


    return (
        <div className="max-w-6xl py-10 mx-auto">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
                {plans.map((plan) => (
                    <PlanCard handleSubscribe={handleSubscribe} key={plan.id} plan={plan}/>
                ))}
            </div>
        </div>
    )
}

