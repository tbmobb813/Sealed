import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { emitActivityEvent } from "../../common/helpers/emit-activity-event";
import { CreateContactDto, UpdateContactDto } from "./dto/create-contact.dto";

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.contact.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(tenantId: string, id: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, tenantId },
    });

    if (!contact) {
      throw new NotFoundException("Contact not found");
    }

    return contact;
  }

  create(tenantId: string, userId: string, dto: CreateContactDto) {
    return this.prisma.$transaction(async (tx) => {
      const contact = await tx.contact.create({
        data: { ...dto, tenantId },
      });

      await emitActivityEvent(tx, {
        tenantId,
        actorId: userId,
        objectType: "contact",
        objectId: contact.id,
        eventType: "contact.created",
        metadata: { name: contact.name, email: contact.email },
      });

      return contact;
    });
  }

  async update(
    tenantId: string,
    userId: string,
    id: string,
    dto: UpdateContactDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.contact.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        throw new NotFoundException("Contact not found");
      }

      const contact = await tx.contact.update({
        where: { id },
        data: dto,
      });

      await emitActivityEvent(tx, {
        tenantId,
        actorId: userId,
        objectType: "contact",
        objectId: id,
        eventType: "contact.updated",
        metadata: { name: contact.name, email: contact.email },
      });

      return contact;
    });
  }

  async remove(tenantId: string, userId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.contact.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        throw new NotFoundException("Contact not found");
      }

      await tx.contact.deleteMany({
        where: { id, tenantId },
      });

      await emitActivityEvent(tx, {
        tenantId,
        actorId: userId,
        objectType: "contact",
        objectId: id,
        eventType: "contact.deleted",
        metadata: { name: existing.name, email: existing.email },
      });

      return existing;
    });
  }
}
