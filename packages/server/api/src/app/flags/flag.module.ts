import { ALL_PRINCIPAL_TYPES, ApFlagId } from '@activepieces/shared'
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { FastifyRequest } from 'fastify'
import { flagService } from './flag.service'
import { flagHooks } from './flags.hooks'

export const flagModule: FastifyPluginAsyncTypebox = async (app) => {
    await app.register(flagController, { prefix: '/v1/flags' })
}

export const flagController: FastifyPluginAsyncTypebox = async (app) => {
    app.get(
        '/',
        {
            config: {
                allowedPrincipals: ALL_PRINCIPAL_TYPES,
            },
            logLevel: 'silent',
        },
        async (request: FastifyRequest) => {
            const flags = await flagService.getAll()
            const flagsMap: Record<string, unknown> = flags.reduce(
                (map, flag) => ({ ...map, [flag.id as string]: flag.value }),
                {},
            )
            return flagHooks.get().modify({
                flags: flagsMap,
                request,
            })
        },
    )

    app.post<{ Body: { licenseKey: string } }>(
        '/saveLicenseKey',
        {
            config: {
                allowedPrincipals: ALL_PRINCIPAL_TYPES,
            },
            schema: {
                body: Type.Object({
                    licenseKey: Type.String(),
                }),
            },
            logLevel: 'silent',
        },
        async (request) => {
            await flagService.save({ id: ApFlagId.LICENSE_KEY, value: request.body.licenseKey })
            return { success: true }
        },
    )

    
}
