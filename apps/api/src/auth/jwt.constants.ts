export const JWT_ISSUER = 'finance-tracker-api';
export const JWT_AUDIENCE = 'finance-tracker-web';
export const JWT_ALGORITHM = 'HS256' as const;

export const JWT_VERIFY_OPTIONS = {
  algorithms: [JWT_ALGORITHM] as [typeof JWT_ALGORITHM],
  issuer: JWT_ISSUER,
  audience: JWT_AUDIENCE,
};
