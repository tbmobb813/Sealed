import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";
import { ContactsService } from "./contacts.service";
import { CreateContactDto } from "./dto/create-contact.dto";
import { UpdateContactDto } from "./dto/create-contact.dto";
export declare class ContactsController {
    private readonly contactsService;
    constructor(contactsService: ContactsService);
    list(user: AuthenticatedUser): Promise<{
        data: {
            id: string;
            tenantId: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            companyName: string | null;
            metadata: import("@sealed/database/generated/client/runtime/library").JsonValue;
        }[];
    }>;
    getOne(user: AuthenticatedUser, id: string): Promise<{
        data: {
            id: string;
            tenantId: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            companyName: string | null;
            metadata: import("@sealed/database/generated/client/runtime/library").JsonValue;
        };
    }>;
    create(user: AuthenticatedUser, dto: CreateContactDto): Promise<{
        data: {
            id: string;
            tenantId: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            companyName: string | null;
            metadata: import("@sealed/database/generated/client/runtime/library").JsonValue;
        };
    }>;
    update(user: AuthenticatedUser, id: string, dto: UpdateContactDto): Promise<{
        data: {
            id: string;
            tenantId: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            companyName: string | null;
            metadata: import("@sealed/database/generated/client/runtime/library").JsonValue;
        };
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        data: {
            id: string;
        };
    }>;
}
//# sourceMappingURL=contacts.controller.d.ts.map