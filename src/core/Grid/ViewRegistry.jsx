export function createViewRenderer(registry, removeView) {
  return function renderView(view) {
    const Comp = registry[view.type];
    if (!Comp) return null;

    return (
      <div key={view.id}>
        <Comp {...view} remove={() => removeView(view.id)} />
      </div>
    );
  };
}
