//stuff to fix
// adding rows with rows already selected doesn't update the row selected array
// shift selection then clicking the last row results in deselecting the last row -> not reproducable anymore???

//jQuery Packager
// pass in schema and data
(function($) {

  $.fn.schemaGrid = function(schema, data) {
    // Assign functions to pager buttons
    var lastsel2 = 0;
    var ajv = new Ajv();
    var currentData = $.extend([], data)
    var currentSchema = $.extend(null, schema);
    var colModelCreate = [];
    var editTypeMap = {
      "string": "text",
      "integer": "text",
      "boolean": "checkbox"
    };

    //creates the column model from schema
    $.each(currentSchema.properties, function(i, item) {
      colModelCreate.push({
        name: i,
        width: 40,
        editable: !item.readonly,
        edittype: editTypeMap[item.type],
        formatter: editTypeMap[item.type],
      });
    });

    //adds row based on the column name and column type
    var addRow = function() {
    	deselectAllSelected(this);
      $(this).jqGrid('setSelection', lastsel2, false);
      var defaultValues = {
        "string": "undef",
        "integer": 0,
        "number": 0,
        "boolean": true
      }
      var row = {};
      $.each(currentSchema.properties, function(i, item) {
        row[i] = defaultValues[item.type];
      });
      if (lastsel2) {
        $(this).jqGrid('addRowData', -1, row, 'after', lastsel2);
      } else {
        $(this).jqGrid('addRowData', -1, row, 'last');
      }
      matchIdWithIndex(this); //fixes id

    }

    var deleteRows = function() {
      var rowId =
        $(this).jqGrid('getGridParam', 'selarrrow');
      for (var i = rowId.length - 1; i >= 0; i--) {
        deleteRowWithID(rowId[i], this);
      }
      matchIdWithIndex(this);
    }

    var deleteRowWithID = function(id, _this) {
      var p = $(_this).jqGrid("getGridParam")
        // delete the row
      $(_this).jqGrid('delRowData', id); //delete row with id
      if (id == lastsel2)
        lastsel2 = 0;
      // editing row way deleted from the grid
      p.savedRow = [];
      delete p.iRow;
      delete p.iCol;
    }

    //deselects all rows
    // different from resetSelection in that it actually saves
    //   the cell after clicking on another row
    var deselectAllSelected = function(_this) {
      $.each($(_this).getDataIDs(), function(_, rowid) {
        if (isSelected(rowid, _this)){
          $(_this).jqGrid('setSelection', rowid, false);
        }
      });
    }

    // Matches index with ID such that the cellEdit doesn't break
    var matchIdWithIndex = function(_this) {
        $.each($(_this).getDataIDs().reverse(), function(iter, rowid) {
          var numRows = $(_this).jqGrid('getGridParam', 'records');
          $("#" + rowid).attr("id", numRows - iter);
        });
      }
      // Checks if the row with rowid is selected
    var isSelected = function(rowid, _this) {
      return $.inArray(rowid, ($(_this).jqGrid('getGridParam', 'selarrrow'))) !== -1;
    }

    //update row so that the cell type matches column type
    var update = function(row) {
      for (var key in row) {
        if (localSchema.properties[key].type === "integer") {
          if (row[key] % 1 === 0)
            row[key] = parseInt(row[key], 10);
        } else if (localSchema.properties[key].type === "number") {
          if (Number(row[key]) === row[key])
            row[key] = parseFloat(row[key])
        } else if (localSchema.properties[key].type === "boolean")
          row[key] = row[key] === "Yes";
      }
      return row;
    }

    this.jqGrid({

      //url: '/jqgrid/event/getall',
      datatype: 'clientSide',
      data: currentData,
      mtype: 'POST',
      editurl: 'clientArray',
      colModel: colModelCreate,
      rowNum: 10,
      rowList: [],
      autowidth: false,
      width: 300,
      //rownumbers: true,
      pager: '#pager',
      sortname: 'id',
      sortorder: "asc",
      caption: "Events",
      emptyrecords: "Empty records",
      loadonce: false,
      pgbuttons: false,
      pgtext: null,
      viewrecords: false,
      multiselect: true,
      cellEdit: true,
      cellsubmit: 'clientArray',

      //shift select, beforeSelectRow
      beforeSelectRow: function(rowid, e) {

        //basic selection
        if (!e.altKey && !e.shiftKey) {
          //check if picked the same row
          if (rowid !== lastsel2 || $(this).jqGrid('getGridParam', 'selarrrow').length > 1) {
            deselectAllSelected(this);
          } else
            return false;
          //shift selection
        } else if (lastsel2 && e.shiftKey) {
          var initialRowSelect = $(this).jqGrid('getGridParam', 'selrow');
          deselectAllSelected(this);

          if (rowid !== lastsel2) {
            var CurrentSelectIndex = $(this).jqGrid('getInd', rowid);
            var InitialSelectIndex = $(this).jqGrid('getInd', initialRowSelect);
            var startID = rowid;
            var endID = initialRowSelect;
            if (CurrentSelectIndex > InitialSelectIndex) {
              startID = initialRowSelect;
              endID = rowid;
            }

            var shouldSelectRow = false;
            var _this = this;
            $.each($("#" + this.id).getDataIDs(), function(_, id) {
              if ((shouldSelectRow = id == startID || shouldSelectRow) && (id != rowid)) {
                $(_this).jqGrid('setSelection', id, false);
              }
              return id != endID;
            });
            lastsel2 = rowid;
          } else {
            $(this).jqGrid('setSelection', rowid, false);
            return false;
          }

          //selection using ctrl
        } else if (e.altKey && isSelected(rowid, this)) {
          return false;
        }
        return true;
      },

      onSelectRow: function(rowid, status, e) {
        lastsel2 = rowid;
      },

      afterSaveCell: function(rowid, cellname, value, iRow, iCol) {
        var row = ($(this)).jqGrid('getRowData', rowid);
        row = update(row);

        var valid = ajv.validate(localSchema, row);
        if (!valid) {
          console.log(ajv.errors[0].message + ' ' + iRow + ' ' + iCol);
          $(this).jqGrid('restoreCell', iRow, iCol);
        } else {
          ($(this)).jqGrid('setRowData', rowid, row)
        }
      },
    });

    $(this).jqGrid('navGrid', '#pager', {
      view: false,
      del: false,
      add: false,
      edit: false,
      search: false,
      refresh: false
    });
    $(this).jqGrid('hideCol', 'cb');
    //$(this).no_legacy_api = false;

    $(this).navButtonAdd('#pager', {
      caption: "Add",
      buttonicon: "ui-icon-plus",
      onClickButton: addRow,
      position: "last",
      title: "",
      cursor: "pointer"
    });

    $(this).navButtonAdd('#pager', {
      caption: "Delete",
      buttonicon: "ui-icon-trash",
      onClickButton: deleteRows,
      position: "last",
      title: "",
      cursor: "pointer"
    });
  }
}(jQuery));

