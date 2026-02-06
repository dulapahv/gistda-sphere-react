import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SphereProvider, useSphereContext } from "../context/SphereContext";
import { createMockSphereApi } from "./setup";

describe("SphereContext", () => {
  const { mockSphere } = createMockSphereApi();

  beforeEach(() => {
    // Reset window.sphere
    window.sphere = undefined;
    vi.clearAllMocks();
  });

  describe("SphereProvider", () => {
    it("renders children", () => {
      // @ts-expect-error - mockSphere is a partial mock
      window.sphere = mockSphere;

      render(
        <SphereProvider apiKey="test-key">
          <div data-testid="child">Child Content</div>
        </SphereProvider>
      );

      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("provides isLoaded=true when sphere API is available", async () => {
      // @ts-expect-error - mockSphere is a partial mock
      window.sphere = mockSphere;

      function TestComponent() {
        const { isLoaded } = useSphereContext();
        return (
          <div data-testid="loaded">{isLoaded ? "loaded" : "loading"}</div>
        );
      }

      render(
        <SphereProvider apiKey="test-key">
          <TestComponent />
        </SphereProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loaded")).toHaveTextContent("loaded");
      });
    });

    it("provides the sphere namespace", async () => {
      // @ts-expect-error - mockSphere is a partial mock
      window.sphere = mockSphere;

      function TestComponent() {
        const { sphere } = useSphereContext();
        return (
          <div data-testid="sphere">{sphere ? "has-sphere" : "no-sphere"}</div>
        );
      }

      render(
        <SphereProvider apiKey="test-key">
          <TestComponent />
        </SphereProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("sphere")).toHaveTextContent("has-sphere");
      });
    });

    it("provides the API key", () => {
      // @ts-expect-error - mockSphere is a partial mock
      window.sphere = mockSphere;

      function TestComponent() {
        const { apiKey } = useSphereContext();
        return <div data-testid="key">{apiKey}</div>;
      }

      render(
        <SphereProvider apiKey="my-api-key">
          <TestComponent />
        </SphereProvider>
      );

      expect(screen.getByTestId("key")).toHaveTextContent("my-api-key");
    });

    it("calls onLoad callback when script loads", async () => {
      // @ts-expect-error - mockSphere is a partial mock
      window.sphere = mockSphere;
      const onLoad = vi.fn();

      render(
        <SphereProvider apiKey="test-key" onLoad={onLoad}>
          <div>Content</div>
        </SphereProvider>
      );

      await waitFor(() => {
        expect(onLoad).toHaveBeenCalled();
      });
    });
  });

  describe("useSphereContext", () => {
    it("throws error when used outside provider", () => {
      function TestComponent() {
        useSphereContext();
        return null;
      }

      expect(() => {
        render(<TestComponent />);
      }).toThrow("useSphereContext must be used within a SphereProvider");
    });
  });
});
