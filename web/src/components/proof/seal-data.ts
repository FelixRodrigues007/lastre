import { CSPR_PACKAGE_URL } from "../../site-links";

export const REFERENCE_MASS = 125_000;
export const TAMPERED_MASS = REFERENCE_MASS + 1;
export const REFERENCE_ORIGIN = "MINA-VALEDOURO-LOTE-001";
export const TAMPERED_ORIGIN = "MINA-VALEDOURO-LOTE-999";

export const SEALS = {
  valid: "472c927a8129dfba4eea2aea00d683d127f8d6387db6fe9d2f779741e4b500f2",
  tamperedMass: "78ef7bbd2f872749bdc5fa9bc7f2232906e2ca59820f5534b555d43df3fad89d",
  tamperedOrigin: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
} as const;

export const CSPR_VERIFY_URL = CSPR_PACKAGE_URL;
