import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { UserRole } from "@sealed/database";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { ContactsService } from "./contacts.service";
import { CreateContactDto } from "./dto/create-contact.dto";
import { UpdateContactDto } from "./dto/create-contact.dto";

@Controller("contacts")
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.contactsService.findAll(user.tenantId);
    return { data };
  }

  @Get(":id")
  async getOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    const data = await this.contactsService.findOne(user.tenantId, id);
    return { data };
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.COLLABORATOR)
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateContactDto,
  ) {
    const data = await this.contactsService.create(
      user.tenantId,
      user.id,
      dto,
    );
    return { data };
  }

  @Patch(":id")
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.COLLABORATOR)
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateContactDto,
  ) {
    const data = await this.contactsService.update(
      user.tenantId,
      user.id,
      id,
      dto,
    );
    return { data };
  }

  @Delete(":id")
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.COLLABORATOR)
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    await this.contactsService.remove(user.tenantId, user.id, id);
    return { data: { id } };
  }
}
