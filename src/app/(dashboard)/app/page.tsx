'use client'
import {useSession} from "next-auth/react"

const Page = () => {
    const session = useSession()
    return (
        <>
            <h1> Protected App </h1>
            <pre>{JSON.stringify(session, null, 2)}</pre>
        </>
    )
}

export default Page