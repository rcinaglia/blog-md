import { createServerFn } from '@tanstack/react-start'
import { bucket, s3 } from "#/lib/s3";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import z from 'zod'

export const listObjects = createServerFn({ method: 'GET' })
    .validator((prefix: unknown) => z.string().default('').parse(prefix))
    .handler(async ({ data: prefix }) => {


        const res = await s3.send((new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: prefix,
            Delimiter: '/'
        })))

        const folders = (res.CommonPrefixes ?? []).map((f) => ({
            type: 'folder' as const,
            name: f.Prefix!.slice(prefix.length).replace(/\/$/, ''),
        }))

        const files = (res.Contents ?? [])
            .filter((f) => f.Key !== prefix && !f.Key?.endsWith('/'))
            .map((f) => ({
                type: 'file' as const,
                name: f.Key!.slice(prefix.length).replace(/\/$/, ''),
                size: f.Size! ?? 0,
                date: f.LastModified!,
                directUrl: `${process.env.S3_PUBLIC_BUCKET_URL!}/${f.Key!}`
            }))
        return [...folders, ...files]
    })