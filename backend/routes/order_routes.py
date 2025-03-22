from flask import Blueprint, request, jsonify, render_template, redirect, url_for, flash
from flask_login import login_required, current_user
from ..database.models import db, Order, OrderItem, Contact

order_bp = Blueprint('orders', __name__)

# Web routes (Jinja2 templates)
@order_bp.route('/orders')
@login_required
def orders():
    user_orders = Order.query.filter_by(user_id=current_user.id).all()
    return render_template('orders.html', orders=user_orders)

@order_bp.route('/orders/add', methods=['GET', 'POST'])
@login_required
def add_order():
    # Get all contacts for the current user for dropdown selection
    contacts = Contact.query.filter_by(user_id=current_user.id).all()
    
    if request.method == 'POST':
        status = request.form.get('status')
        total_amount = request.form.get('total_amount')
        notes = request.form.get('notes')
        contact_id = request.form.get('contact_id')
        
        if not total_amount:
            flash('Total amount is required!', 'danger')
            return redirect(url_for('orders.add_order'))
        
        if not contact_id:
            flash('Contact is required!', 'danger')
            return redirect(url_for('orders.add_order'))
            
        # Validate that contact belongs to user
        contact = Contact.query.filter_by(id=contact_id, user_id=current_user.id).first()
        if not contact:
            flash('Invalid contact!', 'danger')
            return redirect(url_for('orders.add_order'))
            
        new_order = Order(
            status=status or 'Pending',
            total_amount=float(total_amount),
            notes=notes,
            user_id=current_user.id,
            contact_id=contact_id
        )
        
        db.session.add(new_order)
        db.session.commit()
        
        # Process order items
        product_names = request.form.getlist('product_name[]')
        quantities = request.form.getlist('quantity[]')
        prices = request.form.getlist('price[]')
        
        for i in range(len(product_names)):
            if product_names[i] and quantities[i] and prices[i]:
                order_item = OrderItem(
                    product_name=product_names[i],
                    quantity=int(quantities[i]),
                    price=float(prices[i]),
                    order_id=new_order.id
                )
                db.session.add(order_item)
        
        db.session.commit()
        
        flash('Order added successfully!', 'success')
        return redirect(url_for('orders.orders'))
        
    return render_template('add_order.html', contacts=contacts)

@order_bp.route('/orders/<int:order_id>')
@login_required
def view_order(order_id):
    order = Order.query.filter_by(id=order_id, user_id=current_user.id).first_or_404()
    return render_template('view_order.html', order=order)

@order_bp.route('/orders/<int:order_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_order(order_id):
    order = Order.query.filter_by(id=order_id, user_id=current_user.id).first_or_404()
    contacts = Contact.query.filter_by(user_id=current_user.id).all()
    
    if request.method == 'POST':
        order.status = request.form.get('status')
        order.total_amount = float(request.form.get('total_amount'))
        order.notes = request.form.get('notes')
        
        contact_id = request.form.get('contact_id')
        # Validate that contact belongs to user
        contact = Contact.query.filter_by(id=contact_id, user_id=current_user.id).first()
        if not contact:
            flash('Invalid contact!', 'danger')
            return redirect(url_for('orders.edit_order', order_id=order.id))
            
        order.contact_id = contact_id
        
        # Delete existing order items
        for item in order.items:
            db.session.delete(item)
        
        # Process order items
        product_names = request.form.getlist('product_name[]')
        quantities = request.form.getlist('quantity[]')
        prices = request.form.getlist('price[]')
        
        for i in range(len(product_names)):
            if product_names[i] and quantities[i] and prices[i]:
                order_item = OrderItem(
                    product_name=product_names[i],
                    quantity=int(quantities[i]),
                    price=float(prices[i]),
                    order_id=order.id
                )
                db.session.add(order_item)
        
        db.session.commit()
        
        flash('Order updated successfully!', 'success')
        return redirect(url_for('orders.view_order', order_id=order.id))
        
    return render_template('edit_order.html', order=order, contacts=contacts)

@order_bp.route('/orders/<int:order_id>/delete', methods=['POST'])
@login_required
def delete_order(order_id):
    order = Order.query.filter_by(id=order_id, user_id=current_user.id).first_or_404()
    
    # Delete all associated order items
    for item in order.items:
        db.session.delete(item)
    
    db.session.delete(order)
    db.session.commit()
    
    flash('Order deleted successfully!', 'success')
    return redirect(url_for('orders.orders'))

# API routes (for React frontend)
@order_bp.route('/api/orders', methods=['GET'])
@login_required
def api_get_orders():
    orders = Order.query.filter_by(user_id=current_user.id).all()
    return jsonify({
        'orders': [
            {
                'id': order.id,
                'order_number': order.order_number,
                'status': order.status,
                'total_amount': order.total_amount,
                'notes': order.notes,
                'created_at': order.created_at.isoformat(),
                'updated_at': order.updated_at.isoformat(),
                'contact': {
                    'id': order.contact.id,
                    'name': order.contact.name,
                    'email': order.contact.email
                },
                'items': [
                    {
                        'id': item.id,
                        'product_name': item.product_name,
                        'quantity': item.quantity,
                        'price': item.price
                    } for item in order.items
                ]
            } for order in orders
        ]
    }), 200

@order_bp.route('/api/orders', methods=['POST'])
@login_required
def api_create_order():
    data = request.get_json()
    
    if not data or not data.get('total_amount') or not data.get('contact_id'):
        return jsonify({'error': 'Total amount and contact_id are required'}), 400
        
    # Validate that contact belongs to user
    contact = Contact.query.filter_by(id=data['contact_id'], user_id=current_user.id).first()
    if not contact:
        return jsonify({'error': 'Invalid contact'}), 400
        
    new_order = Order(
        status=data.get('status', 'Pending'),
        total_amount=float(data['total_amount']),
        notes=data.get('notes'),
        user_id=current_user.id,
        contact_id=data['contact_id']
    )
    
    db.session.add(new_order)
    db.session.commit()
    
    # Process order items
    if 'items' in data:
        for item_data in data['items']:
            order_item = OrderItem(
                product_name=item_data['product_name'],
                quantity=int(item_data['quantity']),
                price=float(item_data['price']),
                order_id=new_order.id
            )
            db.session.add(order_item)
    
    db.session.commit()
    
    # Get all items for the response
    items = [
        {
            'id': item.id,
            'product_name': item.product_name,
            'quantity': item.quantity,
            'price': item.price
        } for item in new_order.items
    ]
    
    return jsonify({
        'message': 'Order created successfully',
        'order': {
            'id': new_order.id,
            'order_number': new_order.order_number,
            'status': new_order.status,
            'total_amount': new_order.total_amount,
            'notes': new_order.notes,
            'created_at': new_order.created_at.isoformat(),
            'updated_at': new_order.updated_at.isoformat(),
            'contact': {
                'id': contact.id,
                'name': contact.name,
                'email': contact.email
            },
            'items': items
        }
    }), 201

@order_bp.route('/api/orders/<int:order_id>', methods=['GET'])
@login_required
def api_get_order(order_id):
    order = Order.query.filter_by(id=order_id, user_id=current_user.id).first_or_404()
    contact = order.contact
    
    return jsonify({
        'order': {
            'id': order.id,
            'order_number': order.order_number,
            'status': order.status,
            'total_amount': order.total_amount,
            'notes': order.notes,
            'created_at': order.created_at.isoformat(),
            'updated_at': order.updated_at.isoformat(),
            'contact': {
                'id': contact.id,
                'name': contact.name,
                'email': contact.email
            },
            'items': [
                {
                    'id': item.id,
                    'product_name': item.product_name,
                    'quantity': item.quantity,
                    'price': item.price
                } for item in order.items
            ]
        }
    }), 200

@order_bp.route('/api/orders/<int:order_id>', methods=['PUT'])
@login_required
def api_update_order(order_id):
    order = Order.query.filter_by(id=order_id, user_id=current_user.id).first_or_404()
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    if 'status' in data:
        order.status = data['status']
    if 'total_amount' in data:
        order.total_amount = float(data['total_amount'])
    if 'notes' in data:
        order.notes = data['notes']
    if 'contact_id' in data:
        # Validate that contact belongs to user
        contact = Contact.query.filter_by(id=data['contact_id'], user_id=current_user.id).first()
        if not contact:
            return jsonify({'error': 'Invalid contact'}), 400
        order.contact_id = data['contact_id']
    
    # Update order items if provided
    if 'items' in data:
        # Delete existing order items
        for item in order.items:
            db.session.delete(item)
        
        # Create new order items
        for item_data in data['items']:
            order_item = OrderItem(
                product_name=item_data['product_name'],
                quantity=int(item_data['quantity']),
                price=float(item_data['price']),
                order_id=order.id
            )
            db.session.add(order_item)
    
    db.session.commit()
    
    # Refresh order to get updated items
    order = Order.query.get(order_id)
    
    return jsonify({
        'message': 'Order updated successfully',
        'order': {
            'id': order.id,
            'order_number': order.order_number,
            'status': order.status,
            'total_amount': order.total_amount,
            'notes': order.notes,
            'created_at': order.created_at.isoformat(),
            'updated_at': order.updated_at.isoformat(),
            'contact': {
                'id': order.contact.id,
                'name': order.contact.name,
                'email': order.contact.email
            },
            'items': [
                {
                    'id': item.id,
                    'product_name': item.product_name,
                    'quantity': item.quantity,
                    'price': item.price
                } for item in order.items
            ]
        }
    }), 200

@order_bp.route('/api/orders/<int:order_id>', methods=['DELETE'])
@login_required
def api_delete_order(order_id):
    order = Order.query.filter_by(id=order_id, user_id=current_user.id).first_or_404()
    
    # Delete all associated order items
    for item in order.items:
        db.session.delete(item)
    
    db.session.delete(order)
    db.session.commit()
    
    return jsonify({
        'message': 'Order deleted successfully'
    }), 200
