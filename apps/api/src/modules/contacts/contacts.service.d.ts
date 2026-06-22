import { PrismaService } from "../../prisma/prisma.service";
import { CreateContactDto, UpdateContactDto } from "./dto/create-contact.dto";
export declare class ContactsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string): import("@sealed/database").Prisma.PrismaPromise<{
        id: string;
        tenantId: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        companyName: string | null;
        metadata: import("@sealed/database/generated/client/runtime/library").JsonValue;
    }[]>;
    findOne(tenantId: string, id: string): Promise<{
        id: string;
        tenantId: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        companyName: string | null;
        metadata: import("@sealed/database/generated/client/runtime/library").JsonValue;
    }>;
    create(tenantId: string, userId: string, dto: CreateContactDto): Promise<{
        id: string;
        tenantId: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        companyName: string | null;
        metadata: import("@sealed/database/generated/client/runtime/library").JsonValue;
    }>;
    update(tenantId: string, userId: string, id: string, dto: UpdateContactDto): Promise<{
        id: string;
        tenantId: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        companyName: string | null;
        metadata: import("@sealed/database/generated/client/runtime/library").JsonValue;
    }>;
    remove(tenantId: string, userId: string, id: string): Promise<{
        id: string;
        tenantId: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        companyName: string | null;
        metadata: import("@sealed/database/generated/client/runtime/library").JsonValue;
    }>;
}
//# sourceMappingURL=contacts.service.d.ts.map