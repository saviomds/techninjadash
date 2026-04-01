"use client"
import Image from "next/image";
import {useRouter} from "next/navigation";
import { useState } from "react";

export default function LoginLogo({settings}) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);

    return (
        <div className="flex items-center gap-3">
          {settings?.logo && !imgError ? (
            <Image
                src={settings.logo}
                alt="Logo"
                width={42}
                height={42}
                className="rounded-lg object-cover border cursor-pointer"
                onClick={() => router.push("/")}
                onError={() => setImgError(true)}
            />
            ) : (
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-lg font-bold cursor-pointer"
                    onClick={() => router.push("/")}>
                TN
            </div>
            )}
        </div>
    )
}