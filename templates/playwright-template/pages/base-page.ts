import type { Page } from "@playwright/test";

import { FlashMessage } from "../components/flash-message";
import { PrimaryNav } from "../components/primary-nav";
import type { Logger } from "../utils/logger";

export abstract class BasePage {
  readonly nav: PrimaryNav;
  readonly flashMessage: FlashMessage;

  constructor(
    protected readonly page: Page,
    private readonly baseUrl: string,
    protected readonly logger: Logger
  ) {
    this.nav = new PrimaryNav(page, logger.child({ component: "primary-nav" }));
    this.flashMessage = new FlashMessage(page);
  }

  protected buildUrl(pathname: string): string {
    return new URL(pathname, this.baseUrl).toString();
  }
}
