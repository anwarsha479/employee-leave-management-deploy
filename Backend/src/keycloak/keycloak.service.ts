import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class KeycloakService {
  constructor(private readonly configService: ConfigService) {}

  async getAdminToken() {
    const url = `${this.configService.get<string>(
      'KEYCLOAK_URL',
    )}/realms/employee-leave-management/protocol/openid-connect/token`;

    const response = await axios.post(
      url,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.configService.get<string>('KEYCLOAK_CLIENT_ID')!,
        client_secret: this.configService.get<string>(
          'KEYCLOAK_CLIENT_SECRET',
        )!,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    return response.data.access_token;
  }

  async createUser(email: string, password: string, firstName: string) {
    const token = await this.getAdminToken();

    const realm = this.configService.get<string>('KEYCLOAK_REALM');
    const keycloakUrl = this.configService.get<string>('KEYCLOAK_URL');

    await axios.post(
      `${keycloakUrl}/admin/realms/${realm}/users`,
      {
        username: email,
        email,
        firstName,
        enabled: true,
        credentials: [
          {
            type: 'password',
            value: password,
            temporary: false,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
  }

  async deleteUser(email: string) {
    const token = await this.getAdminToken();

    const realm = this.configService.get<string>('KEYCLOAK_REALM');
    const keycloakUrl = this.configService.get<string>('KEYCLOAK_URL');

    const users = await axios.get(
      `${keycloakUrl}/admin/realms/${realm}/users?email=${email}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (users.data.length > 0) {
      const keycloakUserId = users.data[0].id;

      await axios.delete(
        `${keycloakUrl}/admin/realms/${realm}/users/${keycloakUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    }
  }

  async updateUser(oldEmail: string, newEmail: string, firstName: string) {
    const token = await this.getAdminToken();

    const realm = this.configService.get<string>('KEYCLOAK_REALM');
    const keycloakUrl = this.configService.get<string>('KEYCLOAK_URL');

    const users = await axios.get(
      `${keycloakUrl}/admin/realms/${realm}/users?email=${oldEmail}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (users.data.length === 0) {
      return;
    }

    const keycloakUserId = users.data[0].id;

    await axios.put(
      `${keycloakUrl}/admin/realms/${realm}/users/${keycloakUserId}`,
      {
        email: newEmail,
        firstName,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
  }
}
