export interface AuthenticatedUser {
    id: string;
    clerkUserId: string;
    email: string;
    name: string;
    tenantId: string;
    role: string;
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
//# sourceMappingURL=current-user.decorator.d.ts.map