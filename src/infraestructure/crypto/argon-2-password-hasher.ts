import * as argon2 from "argon2";
export class Argon2PasswordHasher {
    private opts = { type: argon2.argon2id, timeCost: 3, memoryCost: 65536, parallelism: 1 };
    hash(plain: string) { return argon2.hash(plain, this.opts); }
    verify(hash: string, plain: string) { return argon2.verify(hash, plain); }
    needsRehash(hash: string) { return !hash.startsWith("$argon2id$"); }
}
