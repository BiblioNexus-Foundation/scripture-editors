type StateHandler<T> = {
  get: () => T;
  set: (value: T) => void;
};

export class MenuCore {
  private optionsCount: number;
  private activeIndexHandler: StateHandler<number>;
  private selectedIndexHandler: StateHandler<number>;

  constructor(
    optionsCount: number,
    activeIndexHandler?: StateHandler<number>,
    selectedIndexHandler?: StateHandler<number>,
  ) {
    this.optionsCount = optionsCount;
    this.activeIndexHandler = activeIndexHandler || {
      get: () => 0,
      set: () => undefined,
    };
    this.selectedIndexHandler = selectedIndexHandler || {
      get: () => -1,
      set: () => undefined,
    };
  }

  moveUp() {
    const currentIndex = this.activeIndexHandler.get();
    const newIndex = (currentIndex - 1 + this.optionsCount) % this.optionsCount;
    this.activeIndexHandler.set(newIndex);
  }

  moveDown() {
    const currentIndex = this.activeIndexHandler.get();
    const newIndex = (currentIndex + 1) % this.optionsCount;
    this.activeIndexHandler.set(newIndex);
  }

  select() {
    const activeIndex = this.activeIndexHandler.get();
    if (activeIndex !== -1) {
      this.selectedIndexHandler.set(activeIndex);
    }
  }

  setActiveIndex(index: number) {
    this.activeIndexHandler.set(index);
  }

  setSelectedIndex(index: number) {
    this.selectedIndexHandler.set(index);
  }

  getActiveIndex(): number {
    return this.activeIndexHandler.get();
  }

  getSelectedIndex(): number {
    return this.selectedIndexHandler.get();
  }

  updateOptionsCount(count: number) {
    this.optionsCount = count;
    const currentActiveIndex = this.activeIndexHandler.get();
    if (currentActiveIndex >= count) {
      this.activeIndexHandler.set(count - 1);
    }
  }
}
