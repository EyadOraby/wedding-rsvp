import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendEmail, sendLater } from "@/lib/email";
import { guestConfirmation, hostAlert } from "../emails";
import { buildFromTemplate } from "../templates";

const content = buildFromTemplate("wedding").content;
content.details.date = "2027-06-12";
const reply = {
  name: "Sara <script>",
  email: "sara@example.com",
  attending: true,
  guestCount: 2,
  message: "See you!",
  answers: { q_meal: "opt_2", q_allergies: "Peanuts" },
};

describe("email content", () => {
  it("confirms the reply to the guest with their edit link", () => {
    const email = guestConfirmation({
      title: "Alex & Sam",
      content,
      reply,
      editUrl: "https://example.com/e/alex-sam/reply/abc",
    });
    expect(email.to).toBe("sara@example.com");
    expect(email.subject).toBe("Your reply to Alex & Sam");
    expect(email.text).toContain("Coming (party of 2)");
    expect(email.text).toContain("Meal choice: Fish");
    expect(email.text).toContain("https://example.com/e/alex-sam/reply/abc");
    expect(email.html).toContain("Saturday, June 12, 2027");
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("Sara &lt;script&gt;");
  });

  it("tells the host who replied", () => {
    const email = hostAlert({
      title: "Alex & Sam",
      content,
      reply: { ...reply, name: "Omar", attending: false, guestCount: 0 },
      hostEmail: "host@example.com",
      dashboardUrl: "https://example.com/dashboard/events/1",
    });
    expect(email.to).toBe("host@example.com");
    expect(email.subject).toBe("Omar can't come · Alex & Sam");
    expect(email.text).toContain("https://example.com/dashboard/events/1");
  });
});

describe("sending", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock
      .mockReset()
      .mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("does nothing without an API key", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    expect(
      await sendEmail({ to: "a@b.co", subject: "s", html: "h", text: "t" }),
    ).toBe(false);
    sendLater([{ to: "a@b.co", subject: "s", html: "h", text: "t" }]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts to Resend with the key and sender", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("EMAIL_FROM", "Hosts <rsvp@example.com>");
    expect(
      await sendEmail({
        to: "a@b.co",
        subject: "Hi",
        html: "<p>h</p>",
        text: "h",
      }),
    ).toBe(true);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer re_test");
    expect(JSON.parse(init.body)).toMatchObject({
      from: "Hosts <rsvp@example.com>",
      to: ["a@b.co"],
      subject: "Hi",
    });
  });
});
