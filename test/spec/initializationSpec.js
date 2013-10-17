describe('Initialization', function() {

  var $element;
  beforeEach(function() {
    $element = $("<input id='spec' />").colorInput();
  });

  it('jQuery Plugin Can Be Created', function() {
    var $element = $("<input id='spec' />").colorInput();
    $('body').find('.colorInput')
  });

  it('Event Fire', function() {
    var $element = $("<input id='spec' />");
    var count = 0;

    $element.on('colorInput::init', function() {
      count++;
    });
    var instance = $element.data('colorInput');
    $element.colorInput();
    expect(count).toEqual(1);

    $element.on('colorInput::ready', function() {
      count++;
    });
    expect(count).toEqual(2);

    $element.on('colorInput::show', function() {
      count++;
    });
    instance.show();
    expect(count).toEqual(3);

    $element.on('colorInput::show', function() {
      count++;
    });
    instance.apply();
    expect(count).toEqual(4);

    $element.on('colorInput::change', function() {
      count++;
    });
    instance.set('#555');
    expect(count).toEqual(4);

    instance.destroy();
  });

  it('Event Fire by multi instance', function() {
    var $eleOne = $("<input id='one' />"),
        $eleTwo = $("<input id='two' />"),
        $doc = $(document),
        count = 0;


    $doc.on('colorInput::init', function() {
        conut++;
    });

    $eleOne.colorInput();
    $eleTwo.colorInput();

    expect(conut).toEqual(2);

    var instanceOne = $eleOne.data('colorInput'),
        instanceTwo = $eleTwo.data('colorInput');

    
  });

  it('should not go next from last page', function() {
    paginator.next();
    expect(paginator.currentPageItems).toEqual([4, 5, 6]);
    paginator.next();
    expect(paginator.currentPageItems).toEqual([4, 5, 6]);
  });

  it('should not go back from first page', function() {
    paginator.previous();
    expect(paginator.currentPageItems).toEqual([1, 2, 3]);
  });
});


