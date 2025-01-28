import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Injectable({})
export class AuthService {
    constructor(private prisma: PrismaService) {}

    async signin(dto: AuthDto) {
        // check if user exists
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })

        if (!user) throw new ForbiddenException('Invalid credentials');

        // check if the password is correct
        const valid = await argon.verify(user.hash, dto.password);
        if (!valid) throw new ForbiddenException('Invalid credentials');

        const { hash: _, ...userWithoutHash } = user;

        return userWithoutHash;
    }

    async signup(dto: AuthDto) {
        // hash the password
        const hash = await argon.hash(dto.password);
        try {
            // save the user to the database
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash,
                }
            })
    
            const { hash: _, ...userWithoutHash } = user;
    
            //return saved user
            return userWithoutHash;
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException('Email already exists');
                }
            }

            throw error;
        }
    }
}