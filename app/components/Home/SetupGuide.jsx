import React, { useState } from "react";
const SetupGuide = () => {
  const [totalSteps, setTotalSteps] = useState([
    {
      id: "install",
      title: "Install App",
      completed: true,
      description: "Congratulations! You have installed the app",
      cta: null,
      expand: true,
    },
    {
      id: "create_collection",
      title: "Create Your First Collection",
      completed: false,
      description: "Get started by creating your first collection.",
      cta: "Create Collection",
      expand: true,
    },
    {
      id: "review",
      title: "Enjoying the app?",
      completed: false,
      description:
        "A quick review would make our day and inspire us to keep innovating!",
      cta: "Leave a Review",
      expand: true,
    },
  ]);

  return (
    <s-section heading="Set up Guide">
      <s-paragraph>
        Welcome to the Collecto - Create data-driven collections easily!
      </s-paragraph>
      <s-paragraph>Get started by following the steps below: </s-paragraph>
      <s-text color="subdued">2/2 steps completed</s-text>

      <s-grid gridTemplateColumns="repeat(2, 1fr)" gap="small">
        <s-grid-item>
          <s-box border="base" borderRadius="base" background="base">
            {totalSteps?.map((step) => (
              <s-stack key={step.id}>
                <s-box padding="base">
                  <s-stack direction="inline" gap="small">
                    <s-icon
                      type={
                        step?.completed
                          ? "check-circle-filled"
                          : "circle-dashed"
                      }
                    />

                    <s-stack
                      direction="inline"
                      justifyContent="space-between"
                      inlineSize="90%"
                    >
                      <s-paragraph>{step.title}</s-paragraph>
                      <s-button
                        accessibilityLabel="chevron-up-down"
                        variant="tertiary"
                        icon={step?.expand ? "chevron-down" : "chevron-up"}
                        onClick={() =>
                          setTotalSteps((prev) =>
                            prev?.map((s) =>
                              s.id === step.id
                                ? { ...s, expand: !s.expand }
                                : s,
                            ),
                          )
                        }
                      />
                    </s-stack>
                  </s-stack>

                  {step?.expand ? (
                    <s-box padding="none small small none">
                      <s-text>{step?.description}</s-text>
                    </s-box>
                  ) : null}
                </s-box>
                <s-divider />
              </s-stack>
            ))}
          </s-box>
        </s-grid-item>

        <s-grid-item>
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/rgZU5pDf6mw?si=Wjv51O9eujw-RvOg"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </s-grid-item>
      </s-grid>
    </s-section>
  );
};

export default SetupGuide;
