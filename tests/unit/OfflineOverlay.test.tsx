import { render, screen } from "@testing-library/react";
import OfflineOverlay from "../../src/components/OfflineOverlay";

describe("OfflineOverlay", () => {
  it("renders when show is true", () => {
    render(<OfflineOverlay show />);
    expect(screen.getByText(/нет подключения/i)).toBeInTheDocument();
  });

  it("does not render when show is false", () => {
    const { container } = render(<OfflineOverlay show={false} />);
    expect(container.firstChild).toBeNull();
  });
});
