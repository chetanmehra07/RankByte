import { UserProfile } from "@clerk/clerk-react";

export default function Profile() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        padding: "40px 20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1150px",
          borderRadius: "24px",
          overflow: "hidden",
        }}
      >
        <UserProfile
          routing="hash"
          appearance={{
            variables: {
              colorText: "var(--primary)",
            },

            elements: {
              /* ROOT */
              rootBox: {
                width: "100%",
                display: "flex",
                justifyContent: "center",
              },

              /* MAIN CARD */
              card: {
                width: "100%",
                background: "var(--card)",
                border: "1px solid var(--border)",
                boxShadow: "none",
                borderRadius: "24px",
              },

              /* LEFT SIDEBAR */
              navbar: {
                background: "var(--card)",
                backgroundImage: "none",
                borderRight: "1px solid var(--border)",
                padding: "20px",
              },

              navbarScrollBox: {
                background: "var(--card)",
              },

              navbarMobileMenuRow: {
                background: "var(--card)",
              },

              scrollBox: {
                background: "var(--card)",
              },

              /* SIDEBAR TITLES */
              navbarTitleText: {
                color: "var(--primary)",
                fontWeight: "700",
              },

              navbarSubtitleText: {
                color: "var(--primary)",
              },

              /* SIDEBAR BUTTONS */
              navbarButton: {
                color: "var(--text)",
                borderRadius: "12px",
                transition: "0.2s ease",
              },

              navbarButtonActive: {
                background: "var(--primary)",
                color: "#fff",
              },

              /* HEADER */
              headerTitle: {
                color: "#ea752d",
                fontSize: "28px",
                fontWeight: "700",
              },

              profilePageTitle: {
                color: "#ea752d",
              },

              headerSubtitle: {
                color: "var(--primary)",
              },

              /* RIGHT CONTENT AREA */
              pageScrollBox: {
                padding: "30px",
                background: "var(--card)",
              },
              accordionTriggerButton: {
                color: "var(--text)",
              },

              actionCard: {
                color: "var(--text)",
              },

              profileSectionPrimaryButton: {
                color: "var(--text)",
              },

              profileSectionContentAction: {
                color: "var(--text)",
              },

              formButtonReset: {
                color: "var(--text)",
              },

              page: {
                background: "var(--card)",
              },

              profilePage: {
                background: "var(--card)",
              },

              profileSection: {
                background: "transparent",
                boxShadow: "none",
              },
              avatarImageActionsUpload: {
                color: "var(--primary)",
              },

              userPreviewAvatarBox: {
                background: "var(--primary)",
              },

              avatarImage: {
                background: "var(--primary)",
              },
              /* SECTION TITLES */
              profileSectionTitleText: {
                color: "var(--text)",
                fontSize: "16px",
                fontWeight: "600",
              },

              /* SECTION CONTENT */
              profileSectionContent: {
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "18px",
                padding: "16px",
              },

              /* LABELS */
              formFieldLabel: {
                color: "var(--text)",
                fontWeight: "600",
              },

              /* INPUTS */
              formFieldInput: {
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                borderRadius: "12px",
              },

              /* BUTTONS */
              formButtonPrimary: {
                background: "var(--primary)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                boxShadow: "none",
              },

              /* USER TEXT */
              userPreviewMainIdentifier: {
                color: "var(--text)",
              },

              userPreviewSecondaryIdentifier: {
                color: "var(--text)",
              },

              /* REMOVE CLERK FOOTER */
              footer: {
                display: "none",
              },

              footerAction: {
                display: "none",
              },

              badge: {
                display: "none",
              },
            },
          }}
        />
      </div>
    </div>
  );
}
