import type {ConfigProfile} from './models'

export type Api = {
    config: {
        profile: {
            list: () => Promise<string[]>
            getName: () => Promise<string>,
            get: () => Promise<ConfigProfile>,
            setActive: (name: string) => Promise<boolean>,
            save: () => Promise<void>,
            onChanged: (cb: (e: { profile: string }) => void) => () => void
        }
    }
}
